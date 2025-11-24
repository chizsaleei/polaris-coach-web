// src/lib/openai/realtime.ts
/**
 * Browser-side helper for OpenAI Realtime via WebRTC.
 * Your server route issues ephemeral tokens:
 * - GET /api/realtime/token -> { client_secret: { value: string }, model: string }
 *
 * Usage in a client component:
 *   const rtc = await createRealtime({
 *     tokenUrl: "/api/realtime/token",
 *     onTranscription: (t) => setText(t),
 *     onResponse: (msg) => console.log(msg),
 *   });
 *   await rtc.startMic();
 *   rtc.sendUserEvent({ type: "start_drill", drillId: "..." });
 */

type RealtimeOptions = {
  tokenUrl: string;
  onResponse?: (msg: any) => void;
  onTranscription?: (text: string) => void;
  iceServers?: RTCIceServer[];
};

export async function createRealtime(opts: RealtimeOptions) {
  const tokenResp = await fetch(opts.tokenUrl, { cache: "no-store" });
  if (!tokenResp.ok) throw new Error("Failed to fetch realtime token");
  const tokenJson = await tokenResp.json();
  const EPHEMERAL_KEY: string = tokenJson?.client_secret?.value;
  const model: string = tokenJson?.model || "gpt-4o-realtime-preview";

  const pc = new RTCPeerConnection({
    iceServers: opts.iceServers || [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // Outbound data channel for user events
  const dc = pc.createDataChannel("oai-events");
  dc.onopen = () => {
    // Can send a hello event here if needed
  };

  // Inbound data channel from model
  pc.ondatachannel = (evt) => {
    const channel = evt.channel;
    channel.onmessage = (m) => {
      try {
        const msg = JSON.parse(m.data);
        if (msg.type === "response.delta" && typeof msg.text === "string") {
          opts.onTranscription?.(msg.text);
        } else {
          opts.onResponse?.(msg);
        }
      } catch {
        // ignore non JSON data
      }
    };
  };

  // Attach model audio track to an <audio> element if desired
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0];
  };

  // Create and send SDP offer
  const offer = await pc.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: false,
  });
  await pc.setLocalDescription(offer);

  // Send SDP to OpenAI Realtime endpoint
  const sdpResp = await fetch(
    (process.env.NEXT_PUBLIC_OPENAI_REALTIME_BASE ||
      "https://api.openai.com") + "/v1/realtime?model=" + encodeURIComponent(model),
    {
      method: "POST",
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
    }
  );

  const answer = {
    type: "answer" as const,
    sdp: await sdpResp.text(),
  };
  await pc.setRemoteDescription(answer);

  async function startMic() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    for (const track of stream.getAudioTracks()) {
      pc.addTrack(track, stream);
    }
  }

  function stop() {
    pc.getSenders().forEach((s) => s.track?.stop());
    pc.close();
  }

  function sendUserEvent(payload: unknown) {
    if (dc.readyState === "open") {
      dc.send(JSON.stringify(payload));
    }
  }

  return { pc, dc, audioEl, startMic, stop, sendUserEvent };
}
