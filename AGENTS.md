# Steads collection

Static hub for Moorstead, Saltstead, Marsstead and Havenstead. Keep game destinations and release status consistent with the public game pages. Havenstead's War prototype is playable; Campaign remains planned. Its card uses a still because its independent frame policy is not assumed to permit embedding.

- Canonical verification: `npm run verify` (dependency-free Node script; validated on Node 22.20.0). Check the rendered cards and follow the changed game link as well.
- Authorised release: commit named reviewed files, then `python scripts/deploy.py --commit FULL_SHA`. This verifies and pushes the exact main commit to the existing GitHub/Vercel integration. Confirm the Vercel status and live page/asset bytes before reporting completion.
- Recovery: revert the release commit, verify, commit and publish through the same path; never force-push. Previous production is `https://steadgames-69t77lsrk-james-cockburns-projects.vercel.app`, corresponding to `1726dad3d339e273a2303384067dce15ca26004c`. No stored data or migration is affected.
- Real captures live in `shots/`; do not substitute illustrations for gameplay. Do not expose private game services or expand framing permissions to add a card.
- Keep hand-written source under 300 nonblank lines. No package installation is required for verification or deployment; Python standard library, Node, Git and the existing hosting integration suffice.
