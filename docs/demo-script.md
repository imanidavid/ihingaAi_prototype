# Live demo script (must always work — re-run after every task)

Roles can be shown in one tab (floating switcher) or in several tabs side by side — the tabs share the demo data.

0. The app opens on the landing page → Sign in (or Create account → sign-up wizard).
1. Sign in as Officer (code 246810). Observations → verify Jean-Baptiste's "Steady overnight rain"
   with a message. Switch to Farmer: report shows Verified + message; "Verified by an officer" 2 → 3.
2. As Farmer: Observations → [Retry now] on the "Not sent" report. As Officer: it appears in To review.
   As Farmer: New observation → type Other, "Hail" → submit → it shows "Under review"; as Officer the
   bell's "Report to review" opens it in Observations → To review, type Hail.
3. As Officer: issue Excess rain · High · Muhoza. Muhoza and the district become High;
   Jean-Baptiste (Kinigi) stays Watch and does not receive it.
4. As Cooperative leader: message Kinigi growers → Jean-Baptiste's bell shows it (Kinyarwanda first).
   Message Busogo growers only → Jean-Baptiste does not receive it.
5. As Officer: Reports → preview a report; the executive summary reflects step 3.
6. Sign out. Sign in as esther.n@ihinga.demo → "Waiting for approval". Sign in as Admin
   (grace.i@ihinga.demo, code 246810) → Users & access → approve Esther. Sign out, sign in as
   Esther (code 246810) → officer dashboard. Reject Celestin with a reason → his sign-in shows it.
7. As Researcher (diane.u@ihinga.demo): dashboard and Model performance reflect step 3's warning
   and step 2's report; Field data shows no farmer names. As Admin, untick "View research data"
   for Researcher → Field data is locked.
8. As Officer: Warnings → Thresholds & rules → set Watch to 45 mm and save → the farmer's
   "Affected sectors" drops Muhoza (3 of 15). Add crop advice to Late Blight Threat → it appears
   on Jean-Baptiste's dashboard; end Heavy Rain Influx → the bean and maize advice disappear.
   As Officer: Weather data → upload the sample station file → farmer weather 21°C / 84%; upload
   the sample forecast → Kinigi High on the farmer's map, month total 323 mm. As Admin: Security &
   audit shows both uploads by Claudine; Data sources shows the manual feed at 4 of 42.
9. As Farmer: Risk forecast → Crop risk matrix shows Irish Potato · Disease / pest High (late blight);
   tap it → the model's reason and the active Late Blight Threat. As Officer: end Late Blight Threat →
   the farmer's cell drops to Low. Warnings → Plan ahead → edit "Wait to topdress urea…" or add an
   Irish Potato item → it appears in the farmer's Recommendations → Plan ahead (and mobile Advice);
   bookmark it → Saved count goes up. A Wheat item does not reach Jean-Baptiste.
10. As Farmer: Crop calendar → Crop phases shows Irish Potato "Early growth · day 23", harvest
    Thu 24/12 – Fri 08/01. Change date → 01/08/2026 → "Tuber filling · day 58", harvest moves to
    19/11 – 04/12; the dashboard's Seasonal calendar footer follows.
11. As Cooperative leader: Needs you today → Review → accept Vestine (Kinigi growers, suggested) and
    Pacifique (choose Muhoza growers) → 188 members. Muhoza growers → Told in person → tick 2 →
    Late Blight acknowledged 28 → 30 of 51, shown "Yes · told by leader" in Members.
12. As Officer: Training → Add lesson "Storing seed potatoes" (Guide, 2 pages, three steps). As
    Cooperative leader: Training → Share it → Kinigi growers → Send. As Farmer: bell "New lesson"
    → Recommendations opens it; Learn shows it above "Recognising late blight early".
13. As Admin: Users & access → Add user → Eric Habimana, Agricultural officer, eric.h@ihinga.demo,
    +250 788 000 091 → Send invitation (email shown). Sign out → Sign in with eric.h@ihinga.demo →
    set a password → code 246810 → officer dashboard. Sign up shows the farmer option only.
14. [Reset demo] restores everything in every role.
