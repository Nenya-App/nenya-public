# Draft: questions for Venice about the E2EE attestation

Not sent. For the owner to edit and send to Venice's support address. It contains nothing about any visitor.

---

Hello,

Nenya (nenya.biz) is a small, open-source (AGPL) site that uses your E2EE model `e2ee-qwen-2-5-7b-p` for a short reflective coaching demo. In our "sealed" mode, the visitor's browser encrypts each message to the enclave key from `/tee/attestation` itself, so our server only relays ciphertext.

We now check the attestation evidence in the browser rather than relying on `verified: true`. Against reports from your endpoint we check:
- that `report_data` is the signing key's address, then 12 zero bytes, then our nonce;
- the TDX quote's signature, the QE report and the PCK chain up to Intel's root;
- that the TD is not in debug mode;
- that the RTMR3 event log replays, and that its `compose-hash` matches `app_compose`;
- the nonce in `nvidia_payload`.

All of that passes. Thank you for including the full evidence. We have a few questions before we describe the mode to our users as end-to-end:

1. **Where the words are read.** The report says `serving: aggregator`, `upstream_model: qwen/qwen-2.5-7b-instruct`, and the app description runs `private-ai-gateway` and `privatemode-proxy`. Is the attested TDX machine the one that decrypts the prompt and runs the model? Or does it decrypt and forward the prompt to a separate inference machine? If it forwards it, how is that hop protected and attested, and is that second attestation something a client can check?
2. **The GPU evidence.** The attested VM reports 16 vCPUs and 32 GB of memory. Does the `nvidia_payload` come from a GPU attached to that same VM, or from the upstream machine? How can a client tell which?
3. **Known-good measurements.** Do you, or Phala, publish the expected `compose-hash`, `os_image_hash` and MRTD for each release, with a reproducible build of `Dstack-TEE/private-ai-gateway`? We'd like to pin them and update them when you announce a change.
4. **Stability.** Can we rely on `report_data` keeping its current layout (address, zero padding, nonce), and on the `intel_quote`, `event_log` and `app_compose` fields staying in the report? Is there a changelog or notice we can follow?
5. **Hardware and region.** Which region or regions serve this model, and which TDX and GPU hardware?
6. **Rate limits.** We cache a verified key for about five minutes. Is there a request limit for `/tee/attestation` we should stay under? Each sealed conversation also asks once from the visitor's browser, with the visitor's own nonce.

Thank you,
Nenya
