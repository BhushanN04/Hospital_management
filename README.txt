SMART HOSPITAL | CLINICAL OPERATIONS
====================================
Professional, responsive HTML/CSS/JavaScript academic demonstration

QUICK START (OFFLINE)
1. Extract this ZIP.
2. Open Smart_Hospital_OPD_Lab_Management/index.html in Chrome or Edge.
3. Sign in using username: admin and password: admin123.
4. Navigate with the sidebar. Sample records are already available to demonstrate workflows.

FREE ONLINE HOSTING (NETLIFY DROP)
1. Extract the ZIP to a folder on your computer.
2. Go to https://app.netlify.com/drop and sign in if requested.
3. Drag the extracted Smart_Hospital_OPD_Lab_Management folder (the folder containing index.html) onto the deploy area.
4. Netlify provides a public *.netlify.app website URL. Open that URL to present your project.
5. For future changes, upload the updated folder again.

DEMO WALKTHROUGH
- Overview: See operational metrics, seven-day OPD activity, consultation queue and recent lab orders.
- Patients: Add, edit, and search patient profiles.
- OPD: Generate a token, assign a department and doctor, update consultation status.
- Laboratory: Request a test, mark sample collected, and enter completed results.
- Billing: Create invoices, update payment status, and print a sample receipt.
- Reports: View workload, activity, export CSV or download a JSON backup.
- Responsive layout: Works on desktop and mobile; use the menu button on smaller screens.

STACK
- HTML5, CSS3, vanilla JavaScript (no build step, no external dependencies)
- Data storage: browser localStorage
- Session: browser sessionStorage
- SVG icons are bundled, so there is no CDN dependency.

IMPORTANT LIMITATIONS
- This is an academic, front-end-only prototype. Sign-in and role choices are simulated, not secure server authentication.
- Data is retained only in the same browser/profile, not synchronized across phones or computers.
- Use fictional/sample information only. Never enter real patient or protected health data.
- Real clinical deployment requires a secured backend and database, real access control, auditing, data privacy compliance, encryption and appropriate regulatory evaluation.

MAIN FILES
index.html          Main interface, modules and forms
css/style.css       Responsive design system
js/app.js           Demo workflows, validation, charts and persistence
assets/favicon.svg  Brand favicon
