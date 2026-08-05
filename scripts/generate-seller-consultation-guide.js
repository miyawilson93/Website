const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const outputPath = path.join(__dirname, "..", "seller-consultation-guide-new-realtor.pdf");

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
  info: {
    Title: "Seller Consultation Guide for New Realtors",
    Author: "MoveWise",
    Subject: "Real estate seller consultation framework",
  },
  bufferPages: true,
});

doc.pipe(fs.createWriteStream(outputPath));

function heading(text) {
  doc.moveDown(0.6);
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
  doc.font("Helvetica").fontSize(11).fillColor("#222222").text(`• ${text}`, {
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
      "MoveWise Seller Consultation Guide | Educational resource only",
      doc.page.margins.left,
      doc.page.height - 34,
      { width: doc.page.width - doc.page.margins.left - doc.page.margins.right, align: "center" }
    );
  }
}

// Cover

doc.rect(0, 0, doc.page.width, 120).fill("#752B1D");
doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24).text("Seller Consultation Guide", 54, 42);
doc.font("Helvetica").fontSize(12).text("For New Realtors", 54, 78);

doc.moveDown(5.6);
doc.fillColor("#111111");
body("Use this guide to run a professional seller consultation that builds confidence, earns trust, and secures listing opportunities. Includes scripts, prep checklists, and follow-up systems.");

line();

heading("How to Use This Guide");
bullet("Review this before every listing appointment until your process is automatic.");
bullet("Print one copy for your notes and one for your seller packet.");
bullet("Customize scripts with your voice while staying compliant with brokerage policy.");
bullet("Always follow local/state laws and fair housing requirements.");

doc.addPage();

heading("Consultation Outcome Goals");
body("By the end of the appointment, your seller should understand market reality, pricing strategy, marketing plan, and next steps. Your goal is to become the clear choice for representation.");
bullet("Build trust and authority quickly.");
bullet("Understand seller timeline, motivations, and expectations.");
bullet("Present a data-driven pricing and launch plan.");
bullet("Explain showing strategy, offer handling, and negotiation process.");
bullet("Secure listing agreement (when appropriate).");

heading("Pre-Consultation Checklist (24 hours before)");
bullet("Confirm appointment time, location, and all decision-makers attending.");
bullet("Research neighborhood comps and active competition.");
bullet("Prepare a net sheet estimate and timeline options.");
bullet("Prepare listing presentation and marketing samples.");
bullet("Review property history, tax info, HOA, and key disclosures.");
bullet("Bring listing paperwork per brokerage policy.");

heading("Opening Script (2-3 minutes)");
body("\"Thank you for meeting with me. My goal today is to understand your priorities, show you what the market says your home can command, and build a clear plan to sell with confidence and as little stress as possible.\"");

heading("Set the Meeting Structure");
bullet("Discovery: goals, timeline, and expectations.");
bullet("Market Review: comps, condition, and pricing.");
bullet("Launch Plan: prep, marketing, showings.");
bullet("Offer Strategy: negotiations and decision framework.");
bullet("Next Steps: responsibilities and schedule.");

doc.addPage();

heading("Seller Discovery Questions");
body("Start broad, then narrow into specifics that impact strategy.");

heading("1) Motivation and Timing");
bullet("Why are you selling right now?");
bullet("What is your ideal move-out or closing date?");
bullet("Is your timeline flexible or fixed?");

heading("2) Financial Expectations");
bullet("What is your target net from the sale?");
bullet("Do you need proceeds for your next purchase?");
bullet("Are there repairs or updates already budgeted?");

heading("3) Property + Condition");
bullet("What updates have been completed in the last 5 years?");
bullet("Any known issues buyers might ask about?");
bullet("What features do you think buyers love most here?");

heading("4) Decision Dynamics");
bullet("Who must approve final decisions on pricing and offers?");
bullet("How quickly can you respond to offer terms?");

heading("Agent Note Prompts");
bullet("Urgency level: low / medium / high");
bullet("Seller priorities: speed, price, convenience, certainty");
bullet("Negotiation style and risk tolerance");

heading("Early Red Flags to Address");
bullet("Price expectation far above market evidence");
bullet("Unwillingness to prepare home for market");
bullet("Multiple decision-makers without clear alignment");
bullet("Timeline pressure without a backup plan");

doc.addPage();

heading("Educating the Seller: Core Talking Points");

heading("Pricing Strategy");
bullet("Price drives attention; attention drives offers.");
bullet("A strong launch price creates momentum.");
bullet("Overpricing can increase days on market and weaken outcomes.");

heading("Market Positioning");
bullet("Compare against active listings buyers are seeing today.");
bullet("Use recent sold data to support realistic expectations.");
bullet("Condition and presentation directly impact perceived value.");

heading("Marketing Plan");
bullet("Professional photos and compelling listing copy.");
bullet("MLS exposure, social media, and targeted promotion.");
bullet("Open house or private showing strategy based on market demand.");

heading("Showing + Offer Process");
bullet("How showings are scheduled and feedback collected.");
bullet("How to evaluate offer strength beyond price.");
bullet("Counteroffer strategy and timeline management.");

heading("Client-Friendly Script: Setting Expectations");
body("\"I’ll guide you from preparation to closing with clear communication and strategy. We’ll make decisions using data, not guesswork, and keep your goals at the center the entire time.\"");

heading("Simple Sale Timeline");
body("Prep -> List -> Showings -> Offers -> Negotiation -> Contract -> Inspection/Appraisal -> Closing");

doc.addPage();

heading("Close the Consultation with Confidence");

heading("Close Script");
body("\"Based on your goals and current market data, I recommend we launch at [price range], complete [prep items], and target a listing date of [date]. If that works for you, I can begin the listing setup today.\"");

heading("Seller Next Steps Checklist");
bullet("Review and sign listing agreement (if moving forward).");
bullet("Finalize prep/repair list and timeline.");
bullet("Confirm showing instructions and availability.");
bullet("Approve photos, remarks, and launch date.");
bullet("Establish communication cadence for feedback and updates.");

heading("Agent Follow-Up (Within 24 hours)");
bullet("Send consultation recap email/text.");
bullet("Share proposed pricing range with comp highlights.");
bullet("Send prep checklist and timeline.");
bullet("Confirm next meeting or listing paperwork signing.");

heading("Follow-Up Message Template");
body("\"Thank you for meeting today. I appreciate the opportunity to help you sell your home. I attached your consultation recap, recommended launch strategy, and next steps. Once you’re ready, I can activate the listing timeline right away.\"");

heading("Listing Packet Checklist");
bullet("Pricing strategy summary");
bullet("Seller net sheet estimate");
bullet("Home prep checklist");
bullet("Marketing plan one-pager");
bullet("Communication expectations");

heading("Compliance Reminder");
body("This guide is an educational framework. Always follow your brokerage policies, state licensing requirements, contract obligations, and fair housing laws.");

line();
body("Prepared for MoveWise | Seller Consultation Guide for New Realtors");

footer();
doc.end();

console.log(`Created: ${outputPath}`);
