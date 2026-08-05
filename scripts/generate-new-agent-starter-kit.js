const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(__dirname, "..", "new-agent-starter-kit-top-producer.pdf");

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  info: {
    Title: "New Agent Starter Kit: 90-Day Top Producer Structure",
    Author: "MoveWise",
    Subject: "Real estate new agent growth system",
  },
  bufferPages: true,
});

doc.pipe(fs.createWriteStream(outputPath));

function heading(text) {
  doc.moveDown(0.55);
  doc.font("Helvetica-Bold").fontSize(14).fillColor("#111111").text(text);
  doc.moveDown(0.2);
}

function body(text) {
  doc.font("Helvetica").fontSize(11).fillColor("#222222").text(text, {
    lineGap: 3,
  });
  doc.moveDown(0.2);
}

function bullet(text) {
  doc.font("Helvetica").fontSize(11).fillColor("#222222").text(`- ${text}`, {
    indent: 10,
    lineGap: 3,
  });
}

function line() {
  const y = doc.y + 5;
  doc
    .strokeColor("#cccccc")
    .lineWidth(1)
    .moveTo(doc.page.margins.left, y)
    .lineTo(doc.page.width - doc.page.margins.right, y)
    .stroke();
  doc.moveDown(0.8);
}

function footer() {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(9).fillColor("#666666");
    doc.text(
      "MoveWise New Agent Starter Kit | Educational resource only",
      doc.page.margins.left,
      doc.page.height - 34,
      { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: "center" }
    );
  }
}

function worksheetField(label) {
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#111111").text(label);
  doc.moveDown(0.15);
  for (let i = 0; i < 3; i += 1) {
    const y = doc.y + 6;
    doc
      .strokeColor("#b8b8b8")
      .lineWidth(0.8)
      .moveTo(doc.page.margins.left, y)
      .lineTo(doc.page.width - doc.page.margins.right, y)
      .stroke();
    doc.moveDown(0.9);
  }
  doc.moveDown(0.2);
}

// Cover
doc.rect(0, 0, doc.page.width, 120).fill("#752B1D");
doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(23).text("New Agent Starter Kit", 54, 38);
doc.font("Helvetica").fontSize(12).text("90-Day Top Producer Structure", 54, 76);

doc.moveDown(5.6);
doc.fillColor("#111111");
body("This kit gives new Realtors a clear execution plan for the first 90 days, daily activity systems, and practical scripts/templates to build momentum quickly.");
body("You can print the worksheets as many times as needed and use them in your weekly business planning.");

line();

heading("What Is Included");
bullet("90-day structure to build lead flow, conversion confidence, and consistency");
bullet("High-impact tips, tricks, and advice most new agents are not taught early");
bullet("Daily tracker worksheet (print one page and make copies)");
bullet("Goal worksheet for clear production targets and activity math");
bullet("Social templates for educational, trust-building content");

doc.addPage();

heading("How Top Producers Think in the First 90 Days");
body("Top producers are not trying to look busy. They are trying to become predictable. They track activity, protect lead follow-up time, and evaluate their own numbers every week.");
bullet("Daily non-negotiables beat random motivation.");
bullet("Lead follow-up speed wins more often than perfect branding.");
bullet("Conversations create closings. Content supports conversations.");
bullet("A small sphere touched consistently outperforms a large sphere ignored.");

heading("Tips Most New Agents Learn Too Late");
bullet("You do not need more leads first. You need better follow-up standards.");
bullet("Buyers and sellers read your confidence from your process, not your years in business.");
bullet("The first hour of your day should never be consumed by social scrolling.");
bullet("Every open house should produce follow-up conversations within 24 hours.");
bullet("You should know your pipeline counts at all times: new leads, nurtures, active clients, signed contracts.");

doc.addPage();

heading("90-Day Structure Overview");
body("Break your first 90 days into three execution phases. Each phase has one mission and a short weekly rhythm.");

heading("Days 1-30 | Build Your Foundation");
bullet("Set your weekly schedule blocks: prospecting, follow-up, appointments, social, admin.");
bullet("Finalize CRM setup and tag pipeline stages.");
bullet("Script practice 20 minutes daily: buyer consult, listing intro, objection handling.");
bullet("Reach out to 5 to 10 sphere contacts daily with value-first conversations.");
bullet("Publish 3 educational posts weekly about the local market and process.");

heading("Days 31-60 | Build Visibility + Conversion");
bullet("Host or co-host at least 2 open houses this month.");
bullet("Use same-day follow-up for all new inquiries.");
bullet("Book consultation calls from your content and sphere touches.");
bullet("Track weekly conversion metrics and adjust scripts.");
bullet("Add referral language to every active client conversation.");

heading("Days 61-90 | Build Consistency + Referrals");
bullet("Tighten your best-performing lead sources and remove low-return tasks.");
bullet("Launch a monthly database nurture touchpoint (email or video).");
bullet("Ask every happy client for review and one referral introduction.");
bullet("Create a repeatable pre-listing and buyer onboarding packet.");
bullet("Prepare next-quarter goals based on real conversion data.");

doc.addPage();

heading("Weekly Rhythm (Simple and Repeatable)");
body("Use this structure each week so your progress is measurable.");
bullet("Monday: pipeline review, lead follow-up sprint, weekly goals reset");
bullet("Tuesday: prospecting block + social content creation");
bullet("Wednesday: appointments, showings, and consult prep");
bullet("Thursday: open house prep or community networking");
bullet("Friday: follow-up closeout, metrics review, next-week setup");
bullet("Saturday/Sunday: client-facing activity and relationship touches");

heading("Numbers to Track Weekly");
bullet("New leads added");
bullet("Follow-up conversations completed");
bullet("Appointments set");
bullet("Buyer consults and listing consults held");
bullet("Active clients in pipeline");
bullet("Referrals requested and received");

heading("Fast Confidence Builders");
bullet("Role-play one script objection daily with another agent.");
bullet("Use a pre-consult checklist for every appointment.");
bullet("Send same-day recap messages after every meaningful conversation.");
bullet("Save your best responses in a personal script bank.");

doc.addPage();

heading("Daily Tracker Worksheet (Print and Copy)");
body("Print this page and make copies for daily use.");

worksheetField("Date:");
worksheetField("Top 3 Income-Producing Priorities:");
worksheetField("Prospecting Contacts Completed (target and actual):");
worksheetField("Follow-Up Conversations Completed:");
worksheetField("Appointments Set or Confirmed:");
worksheetField("Social Content Posted (topic and CTA):");

doc.addPage();

heading("Daily Tracker Worksheet (Page 2)");
worksheetField("Pipeline Snapshot (new leads, nurtures, active clients):");
worksheetField("Client Service Tasks Completed:");
worksheetField("Wins Today:");
worksheetField("Lessons or Objections to Practice:");
worksheetField("Tomorrow's First Priority:");

heading("Use Instructions");
bullet("Keep one copy on your desk and one in your field bag.");
bullet("At end of day, circle what moved business forward.");
bullet("Every Friday, review your 5 most recent sheets for patterns.");

doc.addPage();

heading("Goal Worksheet");
body("Use this worksheet to reverse-engineer monthly production targets into weekly actions.");

worksheetField("Quarterly GCI Goal:");
worksheetField("Average Commission Per Closing:");
worksheetField("Closings Needed This Quarter:");
worksheetField("Appointments Needed Per Month:");
worksheetField("Conversations Needed Per Week:");
worksheetField("Lead Sources to Prioritize (top 3):");

heading("Commitment Block");
worksheetField("What will I do daily no matter what?");
worksheetField("Who will hold me accountable weekly?");

doc.addPage();

heading("Social Templates (Use, Personalize, and Post)");
body("Each template is designed to build trust, invite conversation, and position you as a local guide.");

heading("Template 1: Buyer Education Post");
body("Most first-time buyers think they need 20% down. In many cases, that is not true. If buying this year is on your radar, I can walk you through options and what to expect in our local market. Message me 'BUYER PLAN' and I will send my simple step-by-step guide.");

heading("Template 2: Seller Positioning Post");
body("Thinking about selling in the next 6 to 12 months? The best results usually come from prep done before the sign goes in the yard. If you want a no-pressure game plan for pricing, timeline, and prep, message me 'SELLER PLAN'.");

heading("Template 3: Local Market Snapshot");
body("Quick market update for [CITY/AREA]: inventory is [up/down], average days on market is [X], and well-priced homes are still moving fast. If you want to know what this means for your move, send me a message.");

doc.addPage();

heading("More Social Templates");

heading("Template 4: Open House Follow-Up");
body("Thanks to everyone who stopped by today. If you missed it and want the photo tour plus similar homes in this price range, send me 'TOUR LIST' and I will forward it.");

heading("Template 5: Trust Builder Story");
body("Real estate is not just about contracts, it is about confidence in big decisions. My goal is to make each step clear so clients feel informed, not overwhelmed. If that is the kind of support you want, I am here to help.");

heading("Template 6: Referral Prompt");
body("I am accepting a few new buyer and seller clients this month. If someone you care about needs honest guidance and a clear plan, feel free to connect us. I will take great care of them.");

heading("Template Format You Can Reuse");
bullet("Hook: one myth, one trend, or one question");
bullet("Value: one practical takeaway");
bullet("CTA: one clear next step (message a keyword)");

line();
body("Prepared for MoveWise | New Agent Starter Kit");

footer();
doc.end();

console.log(`Created: ${outputPath}`);