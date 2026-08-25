export interface ProblemStatement {
  id: string;
  title: string;
  domain: string;
  description: string;
}

export const PROBLEM_STATEMENTS: ProblemStatement[] = [
  // 1. AGENTIC & GENERATIVE AI
  {
    id: 'AG001',
    title: 'Application Incident Prediction and Root-Cause Assistant',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: IT Operations / DevOps
Domain / Tech Tags: Time-series AI, Anomaly Detection, AIOps

Real-World Scenario:
A SaaS application contains several microservices. When one service becomes slow, it causes failures in other services and generates hundreds of alerts. Engineers spend considerable time manually comparing logs, performance metrics and deployment history.

Real Problem:
Alert volume hides the first meaningful signal, while symptoms appear across multiple services. Operations teams need early detection and evidence that points to the probable source of failure.

Challenge Statement:
Develop an AI system that analyses application logs, performance metrics and deployment events to detect incidents early, group related alerts and identify the most probable root cause.

Functional Requirements:
• Detect unusual application behaviour.
• Group alerts belonging to the same incident.
• Predict possible service failure.
• Identify the affected microservice.
• Correlate incidents with recent deployments.
• Rank probable root causes.
• Provide supporting log and metric evidence.

Data Source / Feasibility Note:
A growing software company develops cloud-based applications using microservices, CI/CD pipelines and customer-support platforms. Teams must demonstrate an actual AI model or measurable decision engine. A dashboard or generic chatbot without dataset preparation, evaluation and evidence-based output is not sufficient.

Student Learning:
• AIOps
• Log analysis
• Anomaly detection
• Time-series AI
• Microservices
• Explainable AI`
  },
  {
    id: 'AG002',
    title: 'Autonomous Academic Intelligence Platform',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Education
Domain / Tech Tags: Agentic AI, Generative AI, Optimization

Real-World Scenario:
Educational institutions worldwide continue to rely on manual coordination for timetable creation, examination scheduling, faculty workload distribution, classroom allocation, laboratory planning, event management and last-minute academic changes. Existing systems generate static schedules but rarely predict disruptions, optimize resources automatically or support intelligent decision-making.

Challenge Statement:
Design and develop an AI-powered Autonomous Academic Intelligence Platform that acts as a virtual Academic Operations Manager. Instead of only generating timetables, the platform should continuously monitor academic activities, predict conflicts before they occur, recommend optimal decisions and securely manage institutional operations with minimal human intervention.

Functional Requirements:
• Generate optimized academic schedules.
• Predict scheduling conflicts and resource shortages.
• Automatically adapt to faculty leave, holidays, placements, workshops and emergency changes.
• Optimize classrooms, laboratories and faculty workload.
• Simulate multiple scheduling scenarios (Digital Twin) before applying changes.
• Explain every AI recommendation in a human-readable manner.

Non-Functional Requirements:
• Security & Governance inspired by Role-Based Access Control (RBAC).
• Roles may include Administrator, HOD, Faculty, Student, Examination Cell and other institutional users.
• Each role should only access the functions and data relevant to its responsibilities.
• Implement data-level security.
• Include configurable approval workflows.
• Maintain audit logs.
• Include anomaly detection for unauthorized modifications.

Expected Deliverables:
• Admin Portal
• Faculty Portal
• Student Portal
• AI Recommendation Engine
• Dynamic Scheduling Engine
• Conflict Prediction Dashboard
• Resource Optimization Dashboard
• Digital Twin Simulation
• Explainable AI Module
• Security & Audit Dashboard

Expected Outcome:
Build a prototype that transforms academic administration from a manual, reactive process into an intelligent, secure and autonomous ecosystem capable of planning, predicting, optimizing and governing academic operations for schools, colleges, universities and training institutions worldwide.`
  },
  {
    id: 'AG003',
    title: 'Software Requirement Ambiguity and Change-Impact Analyzer',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Software Engineering / Requirements Engineering
Domain / Tech Tags: NLP, Dependency Analysis

Real-World Scenario:
A requirement such as "the application should load quickly" does not define measurable performance expectations. Developers interpret it differently, resulting in rework and incomplete testing. Later, a small requirement change unexpectedly affects several modules and test cases.

Real Problem:
Ambiguous requirements enter development without measurable acceptance conditions, while teams lack a reliable view of which components and tests may be affected by a change.

Challenge Statement:
Develop an AI system that analyses software requirements and user stories to detect ambiguity, missing acceptance criteria and conflicting statements and predicts which software components and tests may be affected by a requirement change.

Functional Requirements:
• Detect vague and unmeasurable requirements.
• Identify missing acceptance criteria.
• Find conflicting or duplicate requirements.
• Generate clarification questions.
• Suggest measurable acceptance conditions.
• Map requirement changes to probable modules.
• Recommend affected test cases and provide supporting evidence.

Data Source / Feasibility Note:
A growing software company develops cloud-based applications using microservices, CI/CD pipelines and customer-support platforms. Teams must demonstrate an actual AI model or measurable decision engine. A dashboard or generic chatbot without dataset preparation, evaluation and evidence-based output is not sufficient.

Student Learning:
• NLP
• Requirements engineering
• Semantic similarity
• Dependency analysis
• Software testing
• Explainable AI`
  },
  {
    id: 'AG004',
    title: 'CI/CD Failure Triage and Flaky-Test Predictor',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: IT Operations / DevOps
Domain / Tech Tags: NLP, Classification and Clustering

Real-World Scenario:
A development team runs hundreds of tests for every code change. Some tests fail because of actual defects, while others fail randomly because of timing, network or environment problems. Developers repeatedly investigate the same failures, delaying software releases.

Real Problem:
Build logs are lengthy and failures are often duplicated across jobs. Teams need a consistent way to separate real regressions from flaky tests and route each failure to the correct component owner.

Challenge Statement:
Develop an AI system that analyses test history, build logs and code changes to classify CI/CD failures, identify duplicate errors and predict unreliable or flaky tests.

Functional Requirements:
• Classify build and test failures.
• Detect flaky tests from execution history.
• Group failures with similar causes.
• Identify the probable affected component.
• Correlate failures with recent code changes.
• Recommend the appropriate developer or team.
• Generate an evidence-based failure summary.

Data Source / Feasibility Note:
A growing software company develops cloud-based applications using microservices, CI/CD pipelines and customer-support platforms. Teams must demonstrate an actual AI model or measurable decision engine. A dashboard or generic chatbot without dataset preparation, evaluation and evidence-based output is not sufficient.

Student Learning:
• Software testing
• CI/CD
• NLP for logs
• Classification
• Clustering
• Failure analysis`
  },
  {
    id: 'AG005',
    title: 'Hackathon Submission Evaluation & Feedback Agent (Judge Copilot)',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Hackathon / Event Operations
Domain / Tech Tags: Agentic AI, Generative AI, Evaluation Automation

Description:
Hackathon judges must evaluate code quality, README clarity, demo completeness, business impact and novelty across 20–50 submissions in a 4–6 hour judging window. Without a structured evaluation framework applied consistently, scores reflect recency bias, presentation quality over technical depth and evaluator fatigue. Technically strong but poorly packaged entries are systematically underscored. Judges also lack the time to perform deep code review, leading to surface-level assessments that fail to reward genuine engineering quality.

Challenge Statement:
Develop an AI-powered Hackathon Submission Evaluation & Feedback Agent that assists judges in evaluating hackathon submissions consistently and efficiently.

Expected Capabilities:
• Analyse submitted project information.
• Evaluate code quality.
• Assess README clarity.
• Evaluate demo completeness.
• Assess business impact.
• Analyse novelty.
• Provide structured evaluation feedback.
• Assist judges in applying evaluation criteria consistently.
• Identify strengths and areas for improvement.

Expected Outcome:
A Judge Copilot that assists hackathon evaluators in performing structured and consistent assessment of project submissions while reducing manual evaluation effort.`
  },
  {
    id: 'AG006',
    title: 'Intelligent IT Support Ticket Management',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: IT Support / Service Management
Domain / Tech Tags: NLP, Semantic Search and RAG

Real-World Scenario:
An IT support team receives thousands of tickets related to login errors, application failures, access requests and performance problems. Tickets are manually categorized, assigned and prioritized. Incorrect routing results in delayed resolution and missed service-level agreements.

Real Problem:
The same issue may be described in many ways, and tickets can contain personal information. Support teams need accurate routing, duplicate detection and grounded guidance without exposing user data.

Challenge Statement:
Develop a privacy-aware AI system that classifies support tickets, identifies duplicates, predicts urgency and retrieves grounded resolution steps from an approved knowledge base.

Functional Requirements:
• Categorize incoming tickets.
• Detect priority and service-level risk.
• Identify duplicate or recurring issues.
• Route tickets to the correct support team.
• Remove unnecessary personal information.
• Retrieve relevant troubleshooting articles.
• Generate a suggested response with source references and human approval.

Data Source / Feasibility Note:
A growing software company develops cloud-based applications using microservices, CI/CD pipelines and customer-support platforms. Teams must demonstrate an actual AI model or measurable decision engine. A dashboard or generic chatbot without dataset preparation, evaluation and evidence-based output is not sufficient.

Student Learning:
• NLP
• Classification
• Semantic search
• RAG
• Privacy
• Explainable AI
• IT Service Management`
  },
  {
    id: 'AG007',
    title: 'Agile Sprint Manager Agent',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Software Engineering / Delivery Management
Domain / Tech Tags: Agentic AI, Software Engineering, Project Management

Description:
Scrum Masters and delivery leads spend a disproportionate portion of their working week on administrative overhead: manually pulling sprint data from Jira, identifying which stories are at risk, following up with developers who have not updated their tickets, and writing the daily stand-up email or Slack message. This leaves insufficient time for high-value Scrum Master activities such as facilitation, impediment removal, coaching and stakeholder communication. Teams often lack a real-time, objective view of sprint health until the Scrum Master manually compiles it.

Challenge Statement:
Develop an AI-powered Agile Sprint Manager Agent that assists Scrum Masters and delivery leads by analysing sprint information, identifying risks and supporting routine sprint management activities.

Expected Capabilities:
• Analyse sprint and task information.
• Identify stories that are at risk.
• Detect tickets that have not been updated.
• Identify potential sprint impediments.
• Assist with developer follow-ups.
• Generate daily stand-up summaries or communications.
• Provide a real-time view of sprint health.

Expected Outcome:
A functional AI-powered sprint management assistant that reduces administrative overhead and provides actionable insights into sprint progress, risks and team activities.`
  },
  {
    id: 'AG008',
    title: 'Regional Language Voice-Based AI Advisory Assistant for Small and Marginal Farmers Using Government Agricultural Data',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Agriculture
Domain / Tech Tags: Generative AI, Voice AI, NLP, Agriculture

Description:
A voice-based AI assistant that understands farmer queries spoken in regional languages and provides instant answers on crop advisories, pest control, government schemes and mandi prices using official agricultural data sources.

Functional Requirements:
• Accept farmer queries through voice input.
• Understand queries spoken in regional languages.
• Provide crop advisories.
• Provide pest control information.
• Provide information about government agricultural schemes.
• Provide mandi price information.
• Use official agricultural data sources to provide relevant information.`
  },
  {
    id: 'AG009',
    title: 'Vendor Onboarding & KYC Validation System',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Vendor Management, Finance
Domain / Tech Tags: RPA, FinOps

Description:
Automates vendor onboarding and KYC document checks.

Functional Requirements:
• Form collection.
• KYC check.
• Approval workflow.

Non-Functional Requirements:
• Privacy.
• Audit logs.

Preferred Tech Stack:
• Python (OCR, Flask, SQLite)
• Node.js (Express, MongoDB)`
  },
  {
    id: 'AG010',
    title: 'Generative AI for Automated MCQ Generation from Textbooks',
    domain: 'AGENTIC & GENERATIVE AI',
    description: `Application Field: Education
Domain / Tech Tags: Generative AI, NLP, EdTech

Description:
Use LLM fine-tuning or prompt engineering to auto-generate multiple-choice questions from academic text, with difficulty tagging and answer key validation.

Functional Requirements:
• Generate multiple-choice questions from academic text.
• Generate suitable answer options.
• Identify the correct answer.
• Tag questions according to difficulty.
• Validate generated questions and answer keys.`
  },

  // 2. COMPUTER VISION & DEEP LEARNING
  {
    id: 'CV001',
    title: 'AI-Driven Handwritten Prescription Digitization and Drug Interaction Alert System for Retail Pharmacies in India',
    domain: 'COMPUTER VISION & DEEP LEARNING',
    description: `Application Field: Healthcare, Retail Pharmacy
Domain / Tech Tags: Computer Vision, OCR, Healthcare AI

Description:
An AI system that reads handwritten doctor prescriptions using handwriting recognition, matches medicines against a drug database, and alerts pharmacists about harmful drug interactions and dosage errors before dispensing.

Functional Requirements:
• Digitize and recognize handwritten prescription content.
• Identify and extract medicine names from prescriptions.
• Match identified medicines against a drug database.
• Detect potentially harmful drug interactions.
• Identify potential dosage errors.
• Generate alerts for pharmacists before dispensing.

Non-Functional Requirements:
• Accuracy in handwriting recognition and medicine identification.
• Reliable drug interaction and dosage validation.
• Secure handling of prescription and patient-related information.

Expected Outcome:
A functional AI-powered prescription digitization and validation system that assists retail pharmacists in accurately interpreting handwritten prescriptions and identifying potential drug interaction and dosage risks before dispensing.`
  },
  {
    id: 'CV002',
    title: 'Lightweight AI-Based Fair Online Exam Proctoring System for Students in Low-Bandwidth Rural Areas',
    domain: 'COMPUTER VISION & DEEP LEARNING',
    description: `Application Field: Education, Online Examinations
Domain / Tech Tags: Computer Vision, Deep Learning, Edge AI

Description:
An AI proctoring solution that detects malpractice through face presence, gaze deviation, and audio anomalies while remaining lightweight enough to run fairly on low-end devices and poor internet connections in rural areas.

Functional Requirements:
• Detect and verify face presence during an online examination.
• Detect significant gaze deviation or unusual gaze behaviour.
• Identify potential audio anomalies.
• Detect potential malpractice indicators using AI-based analysis.
• Provide relevant alerts or indications for suspicious activity.
• Support operation on low-end devices.
• Minimize dependency on high-bandwidth internet connectivity.

Non-Functional Requirements:
• Lightweight and efficient AI inference.
• Fair performance across different device capabilities and network conditions.
• Low-bandwidth operation.
• Privacy-conscious handling of examination data.

Expected Outcome:
A lightweight AI-based online examination proctoring system capable of identifying potential malpractice indicators while remaining usable and fair for students using low-end devices and low-bandwidth internet connections in rural areas.`
  },
  {
    id: 'CV003',
    title: 'AI-Powered Waste Segregation Compliance Monitoring System for Municipal Solid Waste Collection Points',
    domain: 'COMPUTER VISION & DEEP LEARNING',
    description: `Application Field: Municipal Governance, Waste Management
Domain / Tech Tags: Computer Vision, Object Detection, Image Classification

Description:
A computer vision system that analyzes camera feeds at waste collection points to classify incoming waste as wet, dry, plastic, or hazardous, and scores ward-wise segregation compliance for municipal enforcement.

Functional Requirements:
• Analyse camera feeds from waste collection points.
• Detect and classify incoming waste.
• Classify waste into wet, dry, plastic, or hazardous categories.
• Monitor waste segregation at collection points.
• Calculate segregation compliance scores.
• Generate ward-wise segregation compliance information.
• Support municipal enforcement and monitoring activities.

Non-Functional Requirements:
• Reliable waste classification.
• Efficient processing of camera feeds.
• Responsive monitoring and reporting.
• Scalability across multiple waste collection points and wards.

Expected Outcome:
A computer vision-based waste monitoring system that automatically classifies waste at collection points and provides ward-wise segregation compliance scores to support municipal waste management and enforcement.`
  },
  {
    id: 'CV004',
    title: 'Real-Time AI-Based Road Accident Detection and Severity Assessment System from Traffic Surveillance Camera Feeds',
    domain: 'COMPUTER VISION & DEEP LEARNING',
    description: `Application Field: Public Safety, Traffic Management
Domain / Tech Tags: Computer Vision, Deep Learning, Video Analytics

Description:
An AI system that automatically detects road accidents from traffic surveillance video, estimates severity, and instantly alerts emergency control rooms with location details and video evidence to reduce ambulance response time.

Functional Requirements:
• Analyse traffic surveillance camera feeds in real time.
• Detect road accidents automatically from video footage.
• Identify accident events from ongoing traffic activity.
• Estimate the severity of detected accidents.
• Generate alerts for detected accidents.
• Provide the accident location to emergency control rooms.
• Provide relevant video evidence along with the alert.
• Support rapid emergency response and ambulance dispatch.

Non-Functional Requirements:
• Real-time or near-real-time processing.
• Reliable accident detection.
• Accurate severity assessment.
• Low-latency alert generation.
• Reliable operation with continuous surveillance feeds.

Expected Outcome:
A real-time AI-powered accident detection and severity assessment system that identifies road accidents from traffic surveillance feeds and provides emergency control rooms with timely alerts, location information, and video evidence to support faster emergency response.`
  },
  {
    id: 'CV005',
    title: 'Automated Anatomical Coordinate System and Orientation Detection for Medical Imaging Datasets',
    domain: 'COMPUTER VISION & DEEP LEARNING',
    description: `Application Field: Healthcare, Medical Imaging / Radiology
Domain / Tech Tags: Computer Vision, Medical Imaging, 3D Image Processing

Description:
Medical imaging datasets such as CT and X-ray scans can come from different scanners, hospitals, and acquisition protocols. Their coordinate systems, image orientations, origins, and slice directions may vary. This makes it difficult to consistently determine anatomical directions such as Superior/Inferior, Anterior/Posterior, and Left/Right across different datasets.

Functional Requirements:
• Reads the spatial metadata/orientation information from medical imaging datasets.
• Establishes a consistent local anatomical coordinate system for each dataset.
• Automatically identifies the Superior direction/position of the patient.
• Handles datasets with different orientations, origins, slice ordering, and coordinate conventions.
• Provides a standardized representation that can be used by downstream applications such as 3D visualization, image registration, surgical navigation, and AI-based medical image analysis.

Illustrative Output:
Given a CT/DICOM dataset, the system should automatically determine:

Local Coordinate System

X → Left/Right
Y → Anterior/Posterior
Z → Superior/Inferior

and correctly identify the Superior end of the volume, regardless of how the original dataset is stored or oriented.

Bonus Challenge:
• Detect orientation when metadata is incomplete or unreliable.
• Visually display the coordinate axes over the 3D volume.
• Validate the detected orientation against anatomical landmarks.
• Support multiple scanners/DICOM conventions.
• Generate a standardized coordinate transformation matrix for each dataset.`
  },
  {
    id: 'CV006',
    title: 'AI-Based Medical Image Quality Assessment and Enhancement System',
    domain: 'COMPUTER VISION & DEEP LEARNING',
    description: `Application Field: Healthcare, Medical Imaging / Radiology
Domain / Tech Tags: Computer Vision, Deep Learning, Medical Image Processing

Description:
Medical images such as X-rays, CT scans, and MRI scans can have varying image quality due to factors such as noise, motion artifacts, low contrast, poor exposure, and acquisition conditions. Poor-quality images can affect diagnosis, image analysis, registration, and downstream AI models.

Functional Requirements:
• Automatically evaluates the quality of medical images.
• Detects and classifies different types of image-quality issues such as noise, blur, motion artifacts, low contrast, and exposure-related problems.
• Generates an overall image quality score.
• Identifies the regions affected by poor image quality.
• Suggests or performs appropriate image enhancement techniques to improve the image.
• Works across different datasets, scanners, and acquisition conditions.

Illustrative Output:
Given a medical image, the system should:

• Generate an overall Image Quality Score.
• Identify the type and severity of quality degradation.
• Highlight affected regions in the image.
• Generate an enhanced version of the image while preserving important anatomical information.`
  },

  // 3. WEB DEVELOPMENT
  {
    id: 'WD001',
    title: 'Automated Compliance Report Generator',
    domain: 'WEB DEVELOPMENT',
    description: `Application Field: Corporate Governance, IT Compliance
Domain / Tech Tags: Automation, Governance

Description:
Automates compliance checklist processing for GDPR and SOC 2 basics and generates PDF reports.

Functional Requirements:
• Process compliance checklists.
• Perform rule-based compliance checks.
• Generate compliance reports.
• Export reports in PDF format.

Non-Functional Requirements:
• Extensible rule engine.
• Secure configuration management.

Preferred Tech Stack:
• Python (Pandas, Jinja2, Flask)
• Node.js (json-rules-engine, Express, MongoDB)`
  },
  {
    id: 'WD002',
    title: 'SaaS License Usage Tracker & Renewal Manager',
    domain: 'WEB DEVELOPMENT',
    description: `Application Field: IT Procurement, SaaS Management
Domain / Tech Tags: SaaS Automation

Description:
Tracks SaaS license usage and automatically sends renewal reminders.

Functional Requirements:
• Monitor SaaS license usage.
• Track license and renewal information.
• Identify upcoming renewals.
• Automatically send renewal reminders.

Non-Functional Requirements:
• Simple user interface.
• Secure storage.

Preferred Tech Stack:
• Python (Flask, SQLite)
• Node.js (Express, MongoDB)`
  },
  {
    id: 'WD003',
    title: 'A Digital Platform for Shared Container Space Booking for Small Exporters',
    domain: 'WEB DEVELOPMENT',
    description: `Application Field: Logistics, Export, Supply Chain
Domain / Tech Tags: Logistics, Container Booking, Digital Platform

Description:
Develop an app that allows exporters of small consignments to find and book available spaces in partially filled cargo containers nearby.

Functional Requirements:
• Provide registration to local logistics service providers including rail, road, ship, and air service providers with access to their space availability in real time.
• Allow service providers to apply for registration through the app.
• Make service-provider approval a result of an inspection and the quality of data provided by the service provider.
• Provide a self-registration option to traders, including importers and exporters, without inspection or checks.
• Show available space container-wise to all registered traders and logistics service providers.
• Allow traders to book available container space by selecting the required space.
• Support online payment for booked space.
• Provide an online chat window between traders and logistics service providers.
• Provide a link to the payment gateway.

Non-Functional Requirements:
• Real-time availability information.
• Secure online payments.
• Reliable communication between traders and logistics service providers.

Expected Outcome:
A digital platform that enables small exporters to discover and book shared container space while allowing logistics service providers to manage availability, communicate with traders, and support online payments.`
  },
  {
    id: 'WD004',
    title: 'A Web and Mobile Based Inventory Management System Using QR Code',
    domain: 'WEB DEVELOPMENT',
    description: `Application Field: Inventory Management
Domain / Tech Tags: QR Code, Inventory Management, Web & Mobile Application

Description:
Develop a web and mobile-based inventory management system that uses QR codes to efficiently track, manage, and update inventory items. The system should allow users to scan QR codes to quickly access product information, monitor stock levels, record incoming and outgoing items, and maintain accurate inventory records in real time.

Functional Requirements:
• QR code generation and scanning.
• Product and stock management.
• Real-time inventory updates.
• Stock-in and stock-out tracking.
• Low-stock notifications.
• Inventory search and filtering.
• Web and mobile accessibility.
• Inventory reports and analytics.

Non-Functional Requirements:
• Real-time inventory updates.
• Accessibility across web and mobile platforms.
• Easy inventory tracking and management.

Expected Outcome:
A web and mobile-based inventory management system that enables users to efficiently track, manage, and update inventory using QR codes while maintaining accurate inventory records in real time.`
  },
  {
    id: 'WD005',
    title: 'Rural Awareness & Accessibility of Tamil Nadu Government Schemes',
    domain: 'WEB DEVELOPMENT',
    description: `Application Field: Government Services, Rural Development
Domain / Tech Tags: Accessibility, Regional Language, Web Development

Description:
Develop an accessible digital platform that helps people in rural areas discover, understand, and access Tamil Nadu Government schemes relevant to their needs. The platform should present scheme information in a simple and user-friendly manner, with support for regional languages and easy navigation for users with limited digital literacy.

Functional Requirements:
• Search and discover relevant government schemes.
• Provide eligibility-based scheme recommendations.
• Provide simple explanations of scheme benefits and requirements.
• Provide information on required documents and application procedures.
• Provide Tamil language support.
• Provide an accessibility-friendly interface.
• Provide notifications for important scheme updates.
• Provide links or guidance to official application channels.

Non-Functional Requirements:
• User-friendly navigation.
• Accessibility for users with limited digital literacy.
• Regional language support.
• Simple and accessible presentation of information.

Expected Outcome:
An accessible digital platform that helps people in rural areas discover, understand, and access Tamil Nadu Government schemes relevant to their needs.`
  },

  // 4. CYBERSECURITY
  {
    id: 'CS001',
    title: 'Cyberbullying Detection on Social Media using NLP',
    domain: 'CYBERSECURITY',
    description: `Application Field: Social Media, Online Safety
Domain / Tech Tags: Cybersecurity, NLP, Content Moderation

Description:
Build a text classifier using BERT or a fine-tuned transformer model that scans social media posts and comments in real time for harassment, hate speech, and abusive language. Deploy the system as an API service with a moderation dashboard and alert system.

Functional Requirements:
• Analyse social media posts and comments.
• Detect harassment.
• Detect hate speech.
• Detect abusive language.
• Perform text classification in real time.
• Provide an API service for detection.
• Provide a moderation dashboard.
• Generate alerts for detected harmful content.

Non-Functional Requirements:
• Real-time or near-real-time detection.
• Reliable text classification.
• Suitable handling of potentially sensitive user-generated content.

Preferred Tech Stack:
• BERT / Fine-tuned Transformer models
• NLP-based text classification
• API service
• Moderation dashboard`
  },
  {
    id: 'CS002',
    title: 'Multilingual Phishing and Malicious-Link Detection System',
    domain: 'CYBERSECURITY',
    description: `Application Field: Defensive Software
Domain / Tech Tags: Email, URLs, QR, multilingual text

Real-World Scenario:
A college accountant receives an email that appears to come from the principal and requests an urgent payment. A QR code opens a fake sign-in page. The displayed sender name looks correct, but the actual domain is slightly misspelled and the message mixes English with Tamil.

Real Problem:
Phishing indicators can be hidden across email headers, URLs, QR codes and multilingual text. Many security tools return a warning without showing the evidence a user needs to make a safe decision.

Challenge Statement:
Develop an explainable multilingual phishing-detection system that analyses emails, messages, URLs and QR codes, calculates a risk score and clearly explains the detected warning signs.

Functional Requirements:
• Detect suspicious, look-alike and mixed-script domains.
• Compare displayed URLs with their actual destinations without opening them.
• Analyse sender, From, Return-Path and Reply-To differences.
• Process English and at least one Indian language.
• Extract URL text from QR-code images.
• Identify urgency, credential and payment requests.
• Provide a risk score, evidence and recommended safe action.

Data Source / Feasibility Note:
Per the source document's stated boundary for this challenge set (CS-01 to CS-05): Teams may use only public, synthetic, organizer-provided or explicitly authorized data and systems. Live malicious links, unauthorized scanning, dark-web collection and automatic DNS changes are outside scope.

Illustrative Output:
Risk level: High
Score: 87/100

Warning signs:
• Sender domain resembles the official domain but is misspelled.
• Reply-To belongs to a different domain.
• The QR code contains a credential-request URL.

Action:
Do not open the link. Verify through an official contact.

Student Learning:
• Phishing
• Social engineering
• Email headers
• URL analysis
• Unicode security
• QR-code safety
• NLP
• Explainable detection`
  },
  {
    id: 'CS003',
    title: 'Privacy-Preserving Data-Breach Exposure Monitor',
    domain: 'CYBERSECURITY',
    description: `Application Field: Defensive Software
Domain / Tech Tags: HMAC, k-anonymity, Recovery

Real-World Scenario:
A student reuses the same password for email, social media and shopping. The shopping service is breached, but the student remains unaware until an attacker later accesses the email account.

Real Problem:
Exposure monitoring is useful, but a poorly designed monitor can create another privacy risk by storing raw email addresses, phone numbers or passwords.

Challenge Statement:
Develop a privacy-preserving breach exposure system that checks an account or password against authorized breach data without permanently storing the original sensitive value.

Functional Requirements:
• Use public, simulated or organizer-provided breach metadata.
• Tokenize or anonymize identifiers before local comparison.
• Never log or store raw passwords.
• Identify the exposed data classes and calculate account risk.
• Use a privacy-preserving password exposure lookup or local fixture.
• Provide prioritized recovery actions and minimal notification records.
• Exclude dark-web scraping from the solution.

Data Source / Feasibility Note:
Per the source document's stated boundary for this challenge set (CS-01 to CS-05): Teams may use only public, synthetic, organizer-provided or explicitly authorized data and systems. Live malicious links, unauthorized scanning, dark-web collection and automatic DNS changes are outside scope.

Illustrative Output:
Exposure detected: Yes
Risk level: Critical

Potentially exposed:
• Email address
• Password hash
• Phone number

Actions:
Change affected and reused passwords, enable MFA, and review activity.

Student Learning:
• Data breaches
• Hashing
• HMAC
• Salting
• k-anonymity
• Password security
• Privacy engineering
• Incident recovery`
  },
  {
    id: 'CS004',
    title: 'Cybercrime Report Classification and Evidence-Readiness Assistant',
    domain: 'CYBERSECURITY',
    description: `Application Field: Defensive Software
Domain / Tech Tags: NLP, Evidence Readiness, Privacy

Real-World Scenario:
A victim loses money through a fake investment application. They have screenshots, transaction numbers and chat messages but do not know the appropriate report category or which evidence to preserve.

Real Problem:
Victims may be distressed and unfamiliar with reporting terminology. Incorrect classification and missing evidence can make a complaint incomplete and delay action.

Challenge Statement:
Develop a privacy-aware assistant that classifies a victim's description, identifies missing information and produces an evidence-readiness checklist and structured draft report.

Functional Requirements:
• Accept descriptions in English and at least one Indian language.
• Predict up to three relevant cybercrime categories with evidence.
• Ask only category-relevant follow-up questions.
• Identify missing transaction, account, timeline or communication evidence.
• Generate a preservation checklist and structured draft complaint.
• Redact unnecessary sensitive information.
• Avoid automatic submission and final legal conclusions.

Data Source / Feasibility Note:
Per the source document's stated boundary for this challenge set (CS-01 to CS-05): Teams may use only public, synthetic, organizer-provided or explicitly authorized data and systems. Live malicious links, unauthorized scanning, dark-web collection and automatic DNS changes are outside scope.

Illustrative Output:
Likely categories:
• Investment fraud
• Online financial fraud

Missing information:
• Date and time of the payment
• Transaction reference
• App or website address

Preserve:
Screenshots, chat export, receipt and account identifiers.

Student Learning:
• NLP classification
• Cybercrime categories
• Digital evidence
• Data minimization
• Privacy
• Secure application design`
  },
  {
    id: 'CS005',
    title: 'Deepfake-Assisted Fraud Evidence Triage System',
    domain: 'CYBERSECURITY',
    description: `Application Field: Defensive Software
Domain / Tech Tags: Media forensics, hashing, uncertainty

Real-World Scenario:
An employee receives a voice message that appears to be from a director requesting an urgent transfer. Another user receives a manipulated video of a relative asking for emergency financial help.

Real Problem:
AI-generated media can support impersonation and financial fraud. Detection is imperfect, so a tool must communicate indicators and uncertainty rather than claim that a file is definitively real or fake.

Challenge Statement:
Develop a digital-media evidence triage system that analyses uploaded audio, images or short videos for manipulation indicators and produces an explainable authenticity-risk assessment.

Functional Requirements:
• Support at least two media types.
• Calculate a SHA-256 file hash before processing.
• Analyse metadata, encoding and visual or audio inconsistencies.
• Use a pretrained model where appropriate and disclose its limitations.
• Highlight suspicious frames or audio segments.
• Return Suspicious, Lower risk or Inconclusive with calibrated confidence.
• Recommend independent verification through a trusted channel.

Data Source / Feasibility Note:
Per the source document's stated boundary for this challenge set (CS-01 to CS-05): Teams may use only public, synthetic, organizer-provided or explicitly authorized data and systems. Live malicious links, unauthorized scanning, dark-web collection and automatic DNS changes are outside scope.

Illustrative Output:
Assessment: Suspicious

Manipulation confidence: 76%

Indicators:
• Metadata shows multiple encoding operations.
• Visual artifacts appear near the mouth region.

This is not proof. Verify through a trusted communication channel.

Student Learning:
• Digital forensics
• Media metadata
• File hashing
• Pretrained models
• Evidence integrity
• Model limitations
• Responsible AI`
  }
];

export const DOMAIN_COLORS: Record<string, { badgeBg: string, badgeText: string, icon: string, border: string }> = {
  'AGENTIC & GENERATIVE AI': { 
    badgeBg: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)', 
    badgeText: '#0284c7', 
    icon: '#0ea5e9',
    border: 'var(--line)' 
  },
  'COMPUTER VISION & DEEP LEARNING': { 
    badgeBg: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)', 
    badgeText: '#6d28d9', 
    icon: '#8b5cf6',
    border: 'var(--line)'
  },
  'WEB DEVELOPMENT': { 
    badgeBg: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)', 
    badgeText: '#047857', 
    icon: '#10b981',
    border: 'var(--line)'
  },
  'CYBERSECURITY': { 
    badgeBg: 'linear-gradient(135deg, rgba(248, 113, 113, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%)', 
    badgeText: '#b91c1c', 
    icon: '#ef4444',
    border: 'var(--line)'
  }
};
