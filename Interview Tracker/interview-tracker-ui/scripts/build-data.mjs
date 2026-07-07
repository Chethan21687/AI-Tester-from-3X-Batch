// Generates the full 92-candidate seed (src/data/sampleCandidates.js) AND the
// shareable Excel (../data/Candidates_Submission_Log.xlsx) from the PDF data.
// Run: node scripts/build-data.mjs
import * as XLSX from 'xlsx'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- Status mapping (PDF value -> new candidate-status vocabulary) ----
const STATUS_MAP = {
  'Rejected - Tech': 'Screen Reject',
  'Rejected - Rate': 'Screen Reject',
  'Rejected - Notice': 'Screen Reject',
  'Dropped Out': 'Drop-Out',
  'No-Show': 'Drop-Out',
  'On-Hold': 'On Hold',
  'Client Reviewing': 'Submit to Client',
  'Submitted to Client': 'Submit to Client',
  'Interview Scheduled': 'L1 Scheduled',
  'In Interview': 'L2 Scheduled',
  'Selected': 'Final Select',
  'Internal Review': 'Internal Review',
  'Joined': 'Joined'
}
// Per-candidate overrides where the reason implies a more specific status.
const OVERRIDE = { 'Bushra': 'L2 Reject', 'Prashant K. Mishra': 'Duplicate', 'Reshma R': 'Duplicate' }
const RECRUITER = { Roshini: 'Roshini S', Archana: 'Archana H R', Apoorva: 'Apporva M', Reshma: 'Reshma D S' }

function reqStatusFor(s) {
  if (s === 'On Hold') return 'On Hold'
  if (s === 'Joined') return 'Closed'
  return 'Open'
}

// zip parallel arrays of one batch into candidate objects
function batch(reqPrefix, cols) {
  const n = cols.name.length
  const out = []
  for (let i = 0; i < n; i++) {
    const rawStatus = cols.status[i]
    const status = OVERRIDE[cols.name[i]] || STATUS_MAP[rawStatus] || rawStatus
    out.push({
      client: cols.client[i], name: cols.name[i], phone: cols.phone[i], email: cols.email[i],
      totalExp: cols.totalExp[i], relevantExp: cols.relevantExp[i] || '', noticePeriod: cols.notice[i],
      location: cols.location[i], willingRelocate: 'Yes', education: cols.education[i],
      source: cols.source[i], recruiter: RECRUITER[cols.recruiter[i]] || cols.recruiter[i],
      dateSourced: cols.dateSourced[i], dateSubmitted: cols.dateSourced[i],
      currentCTC: cols.currentCTC[i] || '', expectedCTC: cols.expectedCTC[i] || '',
      offeredCTC: (cols.offeredCTC && cols.offeredCTC[i]) || '',
      rateUnit: (cols.rateUnit && cols.rateUnit[i]) || '',
      earliestJoining: (cols.earliest && cols.earliest[i]) || '',
      status, reqStatus: reqStatusFor(status),
      interviewsDone: (cols.interviews && cols.interviews[i]) || '',
      lastRoundOutcome: (cols.lastRound && cols.lastRound[i]) || '',
      interviewDate: '', interviewMode: '', interviewDuration: '',
      owner: '', rejectReason: (cols.reason && cols.reason[i]) || '',
      notes: (cols.notes && cols.notes[i]) || ''
    })
  }
  return out
}

// =================== BATCH 1 (41) ===================
const b1 = batch('R', {
  client: ['CloudByz','CloudByz','CloudByz','Xebia','Xebia','Xebia','Titan','Titan','Titan','Sony','Sony','Sony','Sony','Deloite','Deloite','CloudByz','CloudByz','MedImpact','MedImpact','Sony','Sony','CloudByz','IBM','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','Titan','Titan','Titan','U Harvest','U Harvest','U Harvest','U Harvest','Titan','MedImpact','CloudByz'],
  name: ['Bushra','Vigneswaran Arunagiri','Aditya H','Nitish Dhiman','Pravin keshav Chavan','Abhishek Ranwa','Harish C','Chetan kusagur','Bhumireddy Amrutheswar Reddy','Atul Thakur','Pragya','Rahul Panday','Prashant K. Mishra','Sameer Kumar','Vedanshi Gupta','Deepan P','Sai Karthik','MD Samiullah','P.Mohan','Ranjithkumar.K','Tejasvini kashinath gaikwad','Poonam MM','Kajol rana','Mohammed Zaid Farooqi','Naveen Kumar Eethakottu','Jagadeesh Kumar M','Srikanth Evuru','Avinabh Kumar','Nagesh Shankar Altekar','David Sunaria','Rohit Singh Negi','Mohamed Raiyan','Rajkumar','Denis Sylvester.S','Mukesh Kumar','Sankalp Srivastava','Yogendra Kumar','Manish Kumar','Jaychandhirikha AB','Shaik Subhani','Akhil'],
  phone: ['8660715329','8675864775','8892706003','9997173759','7875820585','8003033965','9894093767','6360973584','9110785724','8770756674','7054813207','6203995972','9663006792','8249549093','6306290951','8508420612','8610713342','6202500664','9490733189','9629622608','7020954749','9036569319','7500558503','8431847310','7801015076','6300887389','+91 9182552567','+91 9113540197','7219302299','9356784743','6397999816','8300968944','8883728975','9025658177','8708599736','9027661696','7238003273','8825222605','6383614975','8317382328','9440274604'],
  email: ['bushram823@gmail.com','vigneswaranofficial@gmail.com','adityamh99@gmail.com','nitishdhiman19021998@gmail.com','pravinchavan121@gmail.com','ranwaabhishek1642879@gmail.com','harishmani4878@gmail.com','chetankusagur501@gmail.com','amrutheswar3005@gmail.com','atulhimi@gmail.com','pragyaporwal61@gmail.com','srpanday94@gmail.com','prashant.fornaukari@gmail.com','sameermeher005@gmail.com','vedanshibang@gmail.com','deepankkl96@gmail.com','saikarthik311202@gmail.com','mdsamiemail@gmail.com','Krishna.dw1987@gmail.com','ranjithranju032@gmail.com','tejug1418@gmail.com','mmpoonam100@gmail.com','kajolrana123@gmail.com','farooqizaid02@gmail.com','eethakottunaveenkumar@gmail.com','jagadeesh.madisetty.c@gmail.com','srikanthevuru8@gmail.com','avinabhk93@gmail.com','nageshaltekar@gmail.com','er.daviddabwali@gmail.com','rohitsinghnegi977@gmail.com','ryan19121999@gmail.com','rajkumarramesh942@gmail.com','denissylvester2001@gmail.com','mukeshprajpati1498@gmail.com','srivastavasankalp90@gmail.com','yogendra830@yahoo.com','manish.sk906@gmail.com','jaychandrika2003@gmail.com','subhanicme@gmail.com','akhilnaidu1422@gmail.com'],
  totalExp: ['2.0 Yrs','3.8 Yrs','4.9 Yrs','6.1 Yrs','6.5 Years','6.3 Years','2.5 Years','3.8 Years','3.3 Years','5.2 Yrs','8.5 Years','7 Years','7 Years','3.7 Yrs','3.6 Yrs','3.2 Yrs','3 Years','7 Years','8.5 Years','7.10 Yrs','6.1 Yrs','3.8 Years','8.0 Yrs','5.3 Years','5.6 Years','6 Years','5 Years','5.5 Years','5 Years','5 Years','5 Years','3 Years','3 Years','3.8 Years','3 Years','3 Years','5.5 Years','5.2 Years','3.8 Years','7+ Years','4.3 Yrs'],
  relevantExp: ['Salesforce - 2.0Yr','CPQ-3.8/Apex-3','CPQ-3.8/Apex-4.6','Angular - 6yrs','Angular-6.5','Angular,Restapi','C#.Net-2.5 Yrs','C#.Net-3.8 Yrs','C#.Net-3 Yrs','Java -5yrs, SB-5y','Java-8.5 Yrs, Rest','Java,SB,RestAPI-6','java-7/Springboot','Boomi - 3.7 Yrs','Boomi - 3.6 Yrs','Salesforce - 2.5Yr','CPQ-3/Apex-3/LWC','Cognos Bi-7','Cognos Developer','Cloud - 6Yrs, IAM','Cloud - 6.1 Yrs, IAM','Salesforce CRM-3','C++ - 5yrs','Oracle PL/SQL-4 Y','Oracle PL/SQL-5 Y','Cognos Bi-4/SQL','Java,Angular,SB','Java,Postgresql-5','React-5/Javascript','Reactjs,Typescript','Reactjs,Typescript','C#.Net-3 Yrs, Win','C#.Net-3 Yrs, Win','C#.Net-3.8 Yrs','.Net,.Net core,C#','.net-3/.net core-3','.Net,API,.Net','.net-5.2/.net core','C#.Net-3.8 Yrs','Cognos Bi-4.5/SQL','SF CRM - 4.0yrs'],
  notice: ['15 Days','Immediate (LWD 30th)','Serving (LWD 1st June)','20th May 2026 LWD','Immediate (LWD 12th)','June 9th LWD Negotiable','15 Days','Immediate','Immediate','5th June 2026 LWD','LWD-1st Jun','Immediate, Dec 2025 LWD','Immediate (LWD 25th)','Immediate - Mar 2026','10th Jun 2026 LWD','Immediate - oct 2025','Immediate (LWD 30th)','Immediate -LWD 30th','Immediate - May 2025','Immediate - 27th May','Immediate - 8th Mar 2026','June 29th LWD','26th June 2026 LWD','Immediate','LWD-8th Jun','Serving (LWD 15th Jun)','Immediate, May 29th','Immediate, May 29th','Immediate - 6th Feb 2026','22nd June 2026 LWD','Immediate - 30th May','Immediate','Immediate','LWD-Jun 15th','Immediate, May 4th LWD','Immediate (LWD 15th)','Immediate, April 20th','Serving (LWD 5th June)','LWD-Jun 10th','15 Days','Immediate - 16th Apr 2026'],
  location: ['Bengaluru','Karaikal','Bangalore','Gurgram','Pune','Gurugram','Bangalore','Karnataka','Chennai','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Chennai','Vellore','Pune','Hyderabad','Combaitore','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Pune','Noida','Noida','Tiruchirapalli','Kadalur','Krishnagiri','Noida','Noida','Noida','Noida','Bangalore','Bangalore','Kadapa'],
  education: ['BE','B Tech','B Tech','MCA','Diploma in CS','Btech','BSc','BTech','BTech','Btech','MCA','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','Btech','M sc','B tech','MCA','BTech','BTech','MCA','Btech','B Tech','Btech','B Tech','B Tech','B Tech','B Tech'],
  source: ['Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','LinkedIn','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri','Naukri'],
  recruiter: ['Roshini','Reshma','Reshma','Roshini','Reshma','Apoorva','Archana','Archana','Archana','Roshini','Archana','Apoorva','Reshma','Roshini','Roshini','Roshini','Reshma','Reshma','Apoorva','Roshini','Roshini','Apoorva','Roshini','Archana','Archana','Reshma','Apoorva','Apoorva','Reshma','Apoorva','Apoorva','Archana','Archana','Archana','Apoorva','Reshma','Apoorva','Reshma','Archana','Reshma','Roshini'],
  dateSourced: ['21st May 2026','21st May 2026','21st May 2026','15th May 2026','15th May 2026','15th May 2026','25th May 2026','25th May 2026','6th May 2026','21st May 2026','21st May 2026','21st May 2026','21st May 2026','25th May 2026','25th May 2026','26th May 2026','26th May 2026','27th May 2026','27th May 2026','1st June 2026','1st June 2026','2nd June 2026','3rd June 2026','3rd June 2026','3rd June 2026','3rd June 2026','3rd June 2026','3rd June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026','4th June 2026'],
  status: ['Rejected - Tech','Joined','Dropped Out','On-Hold','On-Hold','On-Hold','Client Reviewing','Rejected - Tech','Dropped Out','On-Hold','Rejected - Tech','Rejected - Tech','Rejected - Tech','Submitted to Client','Submitted to Client','On-Hold','On-Hold','Interview Scheduled','Rejected - Tech','Rejected - Rate','Submitted to Client','No-Show','On-Hold','Dropped Out','Dropped Out','Rejected - Tech','Interview Scheduled','Dropped Out','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Dropped Out','Rejected - Tech','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Interview Scheduled','Rejected - Tech','On-Hold'],
  currentCTC: ['4.8 LPA','4.44 LPA','4.9 LPA','18.0 LPA','12.73 LPA','12.8 LPA','3.5 LPA','4.2 LPA','4.2 LPA','22.47 LPA','17.0 LPA','16.0 LPA','22.5 LPA','7.0 LPA','5.4 LPA','4.32 LPA','2.88 LPA','14.0 LPA','11.0 LPA','8.2 LPA','12.61 LPA','4.5 LPA','15.0 LPA','7 LPA','11 LPA','10 LPA','9.2 LPA','19.5 LPA','9.5 LPA','9.3 LPA','8.2 LPA','4 LPA','3.6 LPA','3.36 LPA','6.6 LPA','6.45 LPA','10.4 LPA','8.4 LPA','1.9 LPA','14 LPA','15.25 LPA'],
  expectedCTC: ['7.5 LPA','9.5 LPA','11 LPA','25.0 LPA','19 LPA','18 LPA','6 LPA','7 LPA','7.2 LPA','26.0 LPA','21 LPA','27 LPA','29 LPA','10.0 LPA','10.0 LPA','9.0 LPA','6 LPA','19.0 LPA','18.0 LPA','16.0 LPA','17.0 LPA','9 LPA','21.0 LPA','12 LPA','18 LPA','17 LPA','14 LPA','25 LPA','14 LPA','14 LPA','14 LPA','5.5 LPA','5.5 LPA','7 LPA','12 LPA','11 LPA','14 LPA','13 LPA','4 LPA','20.5 LPA','17.5 LPA'],
  offeredCTC: ['','9.0 LPA','11.0 LPA','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',''],
  rateUnit: ['','RS 1,00,000 +GST','RS 1,20,000 +GST'],
  earliest: ['','2nd June','2nd June'],
  interviews: ['Yes','Yes','Yes','No','No','No','No','No','No','No','No','No','No','No','No','No','No','Yes','Yes','No','No','No','No'],
  lastRound: ['Rejected','Selected','Selected','Req Hold','Req Hold','Req Hold'],
  reason: ['L2 Reject - technical','','Dropped - Since holding offer of 15 LPA','','','','','','','','Screen reject - Client portal','Screen reject - Client portal','Duplicate'],
  notes: ['','','','Client req on Hold','Client req on Hold','Got another offer due to delay in client response','Waiting for Interview Slot','Waiting for Interview Slot','Got another offer due to delay in client response','Waiting for Feedback','Screen reject - Client portal','Screen reject - Client portal','Duplicate','Waiting for Feedback','Waiting for Feedback','Req Hold','Req Hold','YL2 To be scheduled','YL2 To be scheduled','Portal Reject','Waiting for Feedback','No show','Duplicate','Waiting for Feedback','Waiting for Feedback','Waiting for Feedback','Waiting for Feedback','Waiting for Feedback']
})

// =================== BATCH 2 (41) ===================
const b2 = batch('R', {
  client: ['CloudByz','Kanini','Kanini','Finastra','Finastra','Titan','Unilog','Unilog','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','MedImpact','CloudByz','CloudByz','Unilog','Unilog','Zafin','Zafin','Zafin','Zafin','Brillio','Brillio','Brillio','Kanini','Kanini','Kanini','MedImpact','CloudByz'],
  name: ['Anand NP','Deepak Kumar Gautam','Dinesh Rajput','Asutosh Das','Sachin Kumar','Balakumar','Kuldeep Singh','Reshma R','Nandhagopan KS','Saheel Navas K','Lathish Babu Tarigopula','Malleshyelavar','Nikita Shailendra Patel','Ayush Bansal','Kaleri Jayanth','Sunil bhati','Iranna Mulimani','Sandarsh M','Sachin Rajendra Khute','Loganathan','Ambika.KB','kethani Vamsikrishna','Raja Kumar Gupta','Akshay Kaveeshwar','Balachandar PB','Jinna Pavan Kumar','Sudhakar.P','Nitish Devadiga','Jai Kumar S D','Riduvan m','Saurabh Nair','Abhijith K A','Ameena VS','Bhavishya Orra','Vaishnavi Chorge','Ravi Kumar AVS','Jugal Pratap','Udhaya Kumar M','Mahadeva Prasad R','Dharani Raja','Megavarshini CV'],
  phone: ['9061785923','9999094868','9074243636','8763185621','7903107147','9952722989','7837195586','7868021733','8217699504','7483268865','7760776705','9187669203','7620375783','7007623051','6301311742','7340430198','8792935635','8123136107','7039545395','9659473391','9916744338','8050652202','6297134890','8197956552','9597093979','8978195314','8056606052','8095402486','8438916278','8907557858','8871720996','7558879338','7994532788','9391979368','8605592484','9398600497','6366744371','8124366867','8050938386','9790943147','7200455369'],
  email: ['anandnandakumar345@gmail.com','deepak.gautam.software@gmail.com','dineshrajput.sd@gmail.com','asutoshdas2708@gmail.com','upadhyaysachin1234@gmail.com','balakumar79@gmail.com','kuldeep.singh.soft.dev@gmail.com','reshkarish797@gmail.com','ngopanks@gmail.com','saheelnavas174@gmail.com','lathish424@gmail.com','malleshyelavar203@gmail.com','patel.nikita1591@gmail.com','ayushblue94@gmail.com','kalerijayanth1@gmail.com','sunilbhati1100@gmail.com','irannabmrolex56@gmail.com','msandarsh25@gmail.com','sachinkhute8814@gmail.com','cloganathan2414@gmail.com','kbambika761@gmail.com','vamsikrishnakethani@gmail.com','raja12design@gmail.com','akkiak95@gmail.com','bala27491@gmail.com','pavankumar.lg77@gmail.com','sudhakarpaa@gmail.com','devadignitish@gmail.com','kjai6935@gmail.com','riduvan96@gmail.com','saurabhn1996@gmail.com','abhijithaka123@gmail.com','vsameena.career@gmail.com','bhavi0613@gmail.com','vaishnavichorge07@gmail.com','ravikumar.antharvedi@gmail.com','jugalpratap29@gmail.com','iamudhayaa@gmail.com','mahadevprasadr@gmail.com','dharaniofficial25@gmail.com','Megavarshini04@gmail.com'],
  totalExp: ['3.8 Yrs','6.5 Yrs','6.7 Yrs','3.10 Yrs','4.0 Yrs','5 Years','3.8 Yrs','4.0 Yrs','4.5 Years','6 Years','5.0 Yrs','5.0 Yrs','8.7 Yrs','9.0 Yrs','5.6 Years','5 Years','5.3 Years','5.5 Years','5.1 Years','5.11 Years','7.1 Years','7 Years','8+ Years','5 Years','8 Years','7.4 Yrs','6.0 Yrs','3.4 Yrs','3.5 Yrs','7.0 Yrs','6.10 Yrs','3.1 Yrs','3.7 Yrs','4.4 Years','4.7 Years','16 Years','6.1 Years','9 Years','5.6 Years','5 Years','3.3 Yrs'],
  relevantExp: ['SF CRM - 2.5 Yrs','IOS - 6.4Yrs, Mon','IOS - 6.7Yrs, core','FTI - 3.10 Yrs','FTI - 4.0 Yrs','Dot net-5','FSD - 3.8Yrs, Vue','FSD - 3.6Yrs, Vue','Cisco UCCE/ Call S','CUCM-6 Yrs, Cisco','PLSQL - 5 Yrs','PLSQL - 5 Yrs','BSA - 8 Yrs','BSA - 5 Yrs','Reactjs-4 Years, Ty','Reactjs-4.9 Years','Informatica-4/PLSQL','Informatica-5.5/P','SQL,ETL-4.5 Years','SQL,PL/SQL-4+ Yrs','JIRA-7.1/JSM-1/JQL','JIRA-7.1/JSM-5/JQL','Figma-6+ Years','Figma,Photoshop','Figma-6 Years, Ad','AWS - 4.0 Yrs','AWS - 6.0 Yrs','Vue.js - 3.4 Yrs','Vue.js - 3.4 Yrs','Js- 7.0Yrs, data','Java- 6.10yrs, data','Java - 3.1 Yrs, Jasp','Java - 3.7 Yrs, Jasp','AEM-3.10 Yrs, Java','AEM-4.7 Yrs, Java','Agentic AI-2+ Years','Ios-6.1 Yrs, MVVM','IOS-7 Years, Swift','ios-5/Swift-5','5 Years','Salesforce admin'],
  notice: ['Immediate - 3rd Apr 2026','Immediate - 24th Mar','Immediate - Sep 2025','30 Days','30 Days','Immediate (LWD 24th)','20th Jun 2026 LWD','Immediate - Dec 2025','LWD-15th June','Immediate','Immediate - May 2026','Immediate - Jun 2026','Immediate - Mar 2026','Immediate - Apr 2026','June 19th LWD','Immediate,May 2026 LWD','Immediate (LWD 30th)','2 Weeks','Immediate, Feb 2026 LWD','Immediate,August 2025','Immediate (LWD 20th)','Serving (LWD 15th Jun)','July 5th LWD','Immediate,Dec 2025 LWD','Immediate, April 2025','Immediate - Oct 2025','Immediate - May 2026','25th Jun 2026 LWD','Immediate - Jun 2026','Immediate - Mar 2026','30 Jun 2026 LWD','29th Jun 2026 LWD','Immediate- Sep 2025 LWD','LWD-31st Mar','15 Days - 20 Days','Immediate, Dec 2025 LWD','Immediate','Immediate','Immediate','Serving (LWD 26th Jun)','Immediate - feb 2026 LWD'],
  location: ['Kerala','UP','Indore','Bengaluru','Bengaluru','Chennai','Punjab','Tamilnadu','Bangalore','Bangalore','Bengaluru','Bengaluru','Bengaluru','Bengaluru','Hyderabad','Hyderabad','Bangalore','Bangalore','Maharashtra','Chennai','Bangalore','Bangalore','Kolkata','Bangalore','Madurai','Bengaluru','Bengaluru','Remote','Remote','Kochi','Kochi','Kochi','Kochi','Andhra','Pune','Hyderabad','Bangalore','Chennai','Bangalore','Bangalore','Combaitore'],
  education: ['B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','BA','Diploma in CS','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','MSC','B Tech','B Tech','B Tech','B Tech','Bsc'],
  source: Array(41).fill('Naukri'),
  recruiter: ['Roshini','Roshini','Roshini','Roshini','Roshini','Reshma','Roshini','Roshini','Archana','Archana','Roshini','Roshini','Roshini','Roshini','Apoorva','Apoorva','Reshma','Reshma','Apoorva','Apoorva','Reshma','Reshma','Apoorva','Apoorva','Apoorva','Roshini','Roshini','Roshini','Roshini','Roshini','Roshini','Roshini','Roshini','Archana','Archana','Apoorva','Archana','Apoorva','Reshma','Reshma','Roshini'],
  dateSourced: ['4th June 2026','4th June 2026','4th June 2026','5th June 2026','5th June 2026','5th June 2026','8th June 2026','8th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','9th June 2026','10th June 2026','10th June 2026','10th June 2026','10th June 2026','10th June 2026','10th June 2026','10th June 2026','10th June 2026','10th June 2026','11th June 2026','11th June 2026','12th June 2026','12th June 2026','12th June 2026','12th June 2026','15th June 2026','15th June 2026','15th June 2026','16th June 2026','16th June 2026','16th June 2026','17th June 2026','18th June 2026'],
  status: ['In Interview','On-Hold','On-Hold','On-Hold','On-Hold','Selected','Interview Scheduled','On-Hold','Submitted to Client','Submitted to Client','Rejected - Tech','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Submitted to Client','Rejected - Tech','Rejected - Tech','On-Hold','On-Hold','On-Hold','On-Hold','On-Hold','On-Hold','On-Hold','On-Hold','On-Hold','Rejected - Tech','Rejected - Notice','On-Hold','In Interview','Joined'],
  currentCTC: ['3.78 LPA','16.0 LPA','10.80 LPA','14.5 LPA','13.0 LPA','14 LPA','5.5 LPA','6.5 LPA','7.8 LPA','9.0 LPA','12.0 LPA','12.0 LPA','11.0 LPA','8.5 LPA','8.8 LPA','6.0 LPA','12.0 LPA','15.5 LPA','9.6 LPA','13.2 LPA','10.0 LPA','10.0 LPA','8.2 LPA','9.5 LPA','5.4 LPA','9.0 LPA','4.0 LPA','6.0 LPA','12.0 LPA','12.0 LPA','22.0 LPA','4.6 LPA','4.20 LPA','10 LPA','12 LPA','18 LPA','8.40 LPA','11.50 LPA','12.34 LPA','9.5 LPA','5.8 LPA'],
  expectedCTC: ['5.0 LPA','18.0 LPA','16.0 LPA','20.0 LPA','16.0 LPA','8.5 LPA','10.0 LPA','10.0 LPA','12 LPA','16.0 LPA','15.0 LPA','15.0 LPA','18.0 LPA','15.0 LPA','19.0 LPA','10.0 LPA','17.0 LPA','22.0 LPA','16.0 LPA','16.0 LPA','20.0 LPA','19.0 LPA','12.0 LPA','13.0 LPA','8.0 LPA','13.0 LPA','10.0 LPA','10.0 LPA','13.5 LPA','20.0 LPA','27.0 LPA','8.5 LPA','5.0 LPA','16 LPA','18 LPA','27 LPA','13.00 LPA','15.00 LPA','17.50 LPA','15 LPA','10.0 LPA'],
  reason: ['','','','','','Got another offer','','Duplicate'],
  notes: []
})

// =================== BATCH 3 (10) ===================
const b3 = batch('R', {
  client: ['CloudByz','Sony','Sony','Sony','Sony','CloudByz','CloudByz','CloudByz','Cyware','Cyware'],
  name: ['Mukesh Singh','Sukesh Kumar','Rahul Rajan Baskaran','Lakku Jayaprakash Reddy','Bissaihgari Janardhan Reddy','Rithisha J','Poongothai M','Kishore Kumar','Dipali Kailas Patil','Aishwarya Todkari'],
  phone: ['8789136254','6200090992','9345852506','7893137299','9380506027','7353177332','8220852648','8072840751','8788632093','9699842274'],
  email: ['mukesh.sfdev@gmail.com','sukeshkr8791@gmail.com','brahulrajan0506@gmail.com','lakkujayaprakash@gmail.com','bsjanardhanreddy@gmail.com','rithidevops12@gmail.com','glancepoongothai@gmail.com','kishorekum4603@gmail.com','dipali956173@gmail.com','aishwaryatodkari15@gmail.com'],
  totalExp: ['4.9 Years','4.2 Yrs','4.2 Yrs','4.1 Yrs','4.1 Yrs','3.8 Years','5 Years','3+ Years','4.9 Yrs','4.0 Yrs'],
  relevantExp: ['Admin-2.9/Sales','','','','','AWS-3.8 Years','AWS-3 Years,Py','AWS-3 Years,Py','Cloud - 4YRS, Tera','Cloud - 4YRS, Tera'],
  notice: ['Immediate (LWD 4th Apr)','Immediate','Immediate','Immediate','Immediate','Immediate, Nov 2025','Immediate, Dec 2025','Immediate Feb 2026','10th jul 2026 LWD','9th Jul 2026 LWD'],
  location: ['Bangalore','Bangalore','Bangalore','Bangalore','Bangalore','Bangalore','Hosur','Bangalore','Pune','Pune'],
  education: ['B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech','B Tech'],
  source: ['Naukri','Internal Bench','Internal Bench','Internal Bench','Internal Bench','Naukri','Naukri','Naukri','Naukri','Naukri'],
  recruiter: ['Reshma','Roshini','Roshini','Roshini','Roshini','Apoorva','Apoorva','Apoorva','Roshini','Roshini'],
  dateSourced: ['18th June 2026','18th June 2026','18th June 2026','18th June 2026','18th June 2026','18th June 2026','18th June 2026','18th June 2026','19th June 2026','19th June 2026'],
  status: ['Rejected - Tech','Rejected - Tech','Rejected - Tech','Rejected - Tech','Rejected - Tech','Internal Review','Internal Review','Internal Review','In Interview','Rejected - Tech'],
  currentCTC: ['4.2 LPA','','','','','4.8 LPA','3.8 LPA','5 LPA','7.0 LPA','4.5 LPA'],
  expectedCTC: ['8 LPA','','','','','9 LPA','7 LPA','8 LPA','11.0 LPA','11.0 LPA'],
  reason: [],
  notes: []
})

const all = [...b1, ...b2, ...b3].map((c, i) => ({ id: 's' + (i + 1), candId: 'C-' + String(i + 1).padStart(3, '0'), ...c }))
// Assign Req IDs grouped by client so requirements are consistent.
const reqByClient = {}
let reqSeq = 0
all.forEach(c => {
  if (!reqByClient[c.client]) reqByClient[c.client] = 'REQ-' + String(++reqSeq).padStart(3, '0')
  c.reqId = reqByClient[c.client]
})

// ---- Emit sampleCandidates.js ----
const js = `// AUTO-GENERATED by scripts/build-data.mjs from the Candidates — Submission Log PDF.
// ${all.length} candidates. Statuses mapped to the current candidate-status vocabulary.
export const sampleCandidates = ${JSON.stringify(all, null, 2)}
`
writeFileSync(resolve(__dirname, '../src/data/sampleCandidates.js'), js)

// ---- Emit Excel (labels as headers) ----
const LABELS = [
  ['candId','Cand ID'],['reqId','Req ID'],['client','Client'],['name','Candidate Name'],
  ['email','Email'],['phone','Phone'],['location','Location (Current)'],['willingRelocate','Willing to Relocate'],
  ['education','Education'],['totalExp','Total Experience (yrs)'],['relevantExp','Relevant Experience'],
  ['noticePeriod','Notice Period'],['source','Source'],['recruiter','Source Detail / Recruiter'],
  ['dateSourced','Date Sourced'],['dateSubmitted','Date Submitted'],['currentCTC','Current CTC'],
  ['expectedCTC','Expected CTC'],['offeredCTC','Offered CTC'],['rateUnit','Rate Unit'],
  ['earliestJoining','Earliest Joining Date'],['status','Status'],['reqStatus','Requirement Status'],
  ['interviewsDone','# Interviews Done'],['lastRoundOutcome','Last Round Outcome'],
  ['interviewMode','Interview Mode'],['interviewDuration','Duration (min)'],
  ['owner','Owner (Recruiter)'],['rejectReason','Reason if Rejected/Dropped'],['notes','Notes']
]
const rows = all.map(c => Object.fromEntries(LABELS.map(([k, label]) => [label, c[k] ?? ''])))
const ws = XLSX.utils.json_to_sheet(rows)
const wb = XLSX.utils.book_new()
XLSX.utils.book_append_sheet(wb, ws, 'Submission Log')
XLSX.writeFile(wb, resolve(__dirname, '../../data/Candidates_Submission_Log.xlsx'))

console.log(`Generated ${all.length} candidates -> sampleCandidates.js and ../data/Candidates_Submission_Log.xlsx`)
