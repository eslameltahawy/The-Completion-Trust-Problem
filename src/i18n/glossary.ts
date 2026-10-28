import type { Locale } from "./locale";

const ar: Record<string, string> = {
  "Data Literacy Fundamentals": "أساسيات فهم البيانات",
  "SQL for Business Analysis": "SQL لتحليل الأعمال",
  "Product Discovery Basics": "أساسيات استكشاف المنتج",
  "Workplace Communication": "التواصل في بيئة العمل",
  "Excel for Operations": "إكسل للعمليات",
  "Agile Delivery for Teams": "التسليم الرشيق للفرق",
  "How to read claims, changes, and charts without overstating what the data shows.":
    "كيف تقرأ الادعاءات والتغيّرات والرسوم من غير أن تبالغ فيما تثبته البيانات.",
  "How to ask a database a question at the right grain.": "كيف تطرح على قاعدة البيانات سؤالًا على المستوى الصحيح.",
  "How to test a feature request before treating it as a requirement.":
    "كيف تختبر طلب ميزة قبل أن تعامله كمتطلب.",
  "How to write a clear update for a mixed audience.": "كيف تكتب تحديثًا واضحًا لجمهور متنوع.",
  "Spreadsheets for operational tracking, lookups, and checks.":
    "جداول لمتابعة العمليات ومراجعتها ودوال البحث فيها.",
  "How a team makes a sprint outcome visible and negotiates change.":
    "كيف يجعل الفريق ناتج السبرنت واضحًا ويتفاوض على التغيير.",
  "Interpret a claim, a percent change, and a chart without adding a cause the data does not show.":
    "فسّر ادعاءً، ونسبة تغيّر، ورسمًا بيانيًا من غير أن تضيف سببًا لا تظهره البيانات.",
  "Write a grouped count and explain what a join does to that count.":
    "اكتب عددًا مجمّعًا واشرح أثر الربط (Join) على هذا العدد.",
  "Frame a request as a problem, an assumption, and a test.": "صُغ الطلب كمشكلة وافتراض واختبار.",
  "Draft a short status update. No competency assessment has been designed for this course.":
    "اكتب تحديث حالة قصيرًا. لم يُصمَّم بعد تقييم كفاءة لهذه الدورة.",
  "Version 1 covered formulas, tables, and basic charts. It did not assess data-integrity checks.":
    "غطت النسخة الأولى المعادلات والجداول والرسوم الأساسية، ولم تقيّم مراجعات سلامة البيانات.",
  "Version 2 adds lookup audits and data-integrity checks. A version 1 completion does not cover these objectives.":
    "تضيف النسخة الثانية مراجعة دوال البحث وفحوص سلامة البيانات. إتمام النسخة الأولى لا يغطي هذه الأهداف.",
  "Connect sprint activity to an outcome and respond to a mid-sprint change.":
    "اربط عمل السبرنت بناتج واضح، وتعامل مع تغيير يحدث في منتصفه.",
  "Interpret data claims": "تفسير الادعاءات المبنية على البيانات",
  "Query at the right grain": "الاستعلام على المستوى الصحيح",
  "Frame a discovery test": "صياغة اختبار استكشاف",
  "Audit a spreadsheet lookup": "مراجعة دالة البحث في الجدول",
  "Protect a sprint outcome": "حماية ناتج السبرنت",
  "The learner can describe what a simple comparison does and does not prove.":
    "يستطيع المتعلّم أن يصف ما تثبته المقارنة البسيطة وما لا تثبته.",
  "The learner can count records at the grain the question asks for.":
    "يستطيع المتعلّم عدّ السجلات على المستوى الذي يطلبه السؤال.",
  "The learner can turn a feature request into a problem, an assumption, and a test.":
    "يستطيع المتعلّم تحويل طلب الميزة إلى مشكلة وافتراض واختبار.",
  "The learner can spot a reference or lookup error in an operations sheet.":
    "يستطيع المتعلّم اكتشاف خطأ في مرجع أو دالة بحث داخل جدول تشغيلي.",
  "The learner can distinguish a sprint goal from a task list and name a tradeoff.":
    "يستطيع المتعلّم التمييز بين هدف السبرنت وقائمة المهام، وتسمية التنازل المطلوب.",
  "Automatically graded quiz": "اختبار يُصحَّح تلقائيًا",
  auto_graded_quiz: "اختبار يُصحَّح تلقائيًا",
  scenario_short_answer: "تقييم بموقف عملي وإجابات قصيرة",
  practical_task: "مهمة عملية",
  simulated_integrity_quiz: "اختبار وموقف عملي مع إشارات نزاهة تجريبية",
  "Scenario and short-answer assessment": "تقييم بموقف عملي وإجابات قصيرة",
  "Practical task": "مهمة عملية",
  "Quiz and scenario with prototype integrity signals": "اختبار وموقف عملي مع إشارات نزاهة تجريبية",
  "Automatically graded quiz. The score is a proposal for the reviewer.":
    "اختبار يُصحَّح تلقائيًا. الدرجة اقتراح للمراجع، وليست قرار الإصدار.",
  "Scenario and short-answer assessment. Rubric levels are not an answer-similarity score.":
    "تقييم بموقف عملي وإجابات قصيرة. مستويات المعيار ليست نسبة تشابه بين النصوص.",
  "Practical task reviewed against a rubric. There is no numeric pass mark.":
    "مهمة عملية تُراجع وفق معيار. لا توجد درجة نجاح رقمية.",
  "Quiz for Excel version 2 only.": "اختبار خاص بالنسخة الثانية من دورة إكسل فقط.",
  "Prototype integrity signals only. A signal cannot reject the attempt by itself.":
    "إشارات نزاهة تجريبية فقط. الإشارة وحدها لا ترفض المحاولة.",
  "Data claims quiz": "اختبار الادعاءات المبنية على البيانات",
  "Ticket-count scenario": "موقف عدّ التذاكر",
  "Export-request practical": "مهمة عملية لطلب التصدير",
  "Lookup audit quiz": "اختبار مراجعة دالة البحث",
  "Sprint outcome assessment": "تقييم ناتج السبرنت",
  Demonstrated: "أُثبتت المهارة",
  "Demonstrated after reviewer override": "أُثبتت المهارة بعد تعديل المراجع",
  Partial: "جزئي",
  "Not demonstrated": "لم تُثبت",
  "Grouped count": "العدد المجمّع",
  "Join grain": "مستوى الربط",
  "Problem framing": "صياغة المشكلة",
  "Rejected metric": "مقياس غير مناسب",
  "Lookup audit": "مراجعة دالة البحث",
  "Sprint outcome": "ناتج السبرنت",
  "Change tradeoff": "تنازل التغيير",
  Verified: "موثّق",
  Revoked: "مُلغاة",
  "Pending Review": "قيد المراجعة",
  "Not Verified / Not Issued": "غير موثّق / لم تُصدر",
  "Returned for further review": "أُعيدت لمراجعة إضافية",
  "In Progress": "قيد التنفيذ",
  Submitted: "مُرسلة",
  "Historical Certificate": "شهادة تاريخية",
  "Assessment Design Required": "تصميم التقييم مطلوب",
  "Not Yet Eligible": "غير مؤهل بعد",
  "Assessment Not Started": "التقييم لم يبدأ",
  learner: "المتعلّم",
  reviewer: "المراجع",
  "Certificate of Completion": "شهادة إتمام",
  "A reviewer approved issuance after the assessment was checked against the published rubric. The public summary omits answers, integrity signals, and reviewer notes. A score, where one exists, did not issue this certificate by itself.":
    "وافق المراجع على الإصدار بعد مراجعة التقييم وفق المعيار المنشور. الملخص العام لا يعرض الإجابات ولا إشارات النزاهة ولا ملاحظات المراجع. الدرجة، إن وُجدت، لم تُصدر الشهادة وحدها.",
  "A reviewer approved issuance and recorded a reason for changing the proposed result. The public summary omits answers, integrity signals, and reviewer notes. A score, where one exists, did not issue this certificate by itself.":
    "وافق المراجع على الإصدار وسجّل سبب تغيير النتيجة المقترحة. الملخص العام لا يعرض الإجابات ولا إشارات النزاهة ولا ملاحظات المراجع. الدرجة، إن وُجدت، لم تُصدر الشهادة وحدها.",
  "A city report shows ice cream sales and drowning incidents rising in the same months. Which conclusion is supported?":
    "يُظهر تقرير مدينة ارتفاع مبيعات الآيس كريم وحوادث الغرق في الأشهر نفسها. أي استنتاج يدعمه ذلك؟",
  "Ice cream sales cause drowning.": "مبيعات الآيس كريم تسبب الغرق.",
  "The two measures move together, which does not by itself show that one causes the other.":
    "المؤشران يتحركان معًا، وهذا وحده لا يثبت أن أحدهما يسبب الآخر.",
  "Drowning incidents cause ice cream sales.": "حوادث الغرق تسبب مبيعات الآيس كريم.",
  "The relationship is meaningless whenever both are percentages.":
    "العلاقة بلا معنى كلما كان الاثنان نسبتين مئويتين.",
  "Headcount moved from 80 to 100. Which statement is accurate?":
    "ارتفع عدد الموظفين من 80 إلى 100. أي عبارة دقيقة؟",
  "Headcount grew by 20 percent and by 20 percentage points.":
    "زاد العدد بنسبة 20 بالمئة وبمقدار 20 نقطة مئوية.",
  "Headcount grew by 20 people, which is a 25 percent increase.":
    "زاد العدد بمقدار 20 شخصًا، أي بنسبة 25 بالمئة.",
  "Headcount grew by 25 people.": "زاد العدد بمقدار 25 شخصًا.",
  "Headcount grew by 80 percent.": "زاد العدد بنسبة 80 بالمئة.",
  "A bar chart of completion rates starts at 90 rather than 0. What is the main risk?":
    "يبدأ رسم أعمدة لنسب الإتمام من 90 بدلًا من صفر. ما الخطر الأساسي؟",
  "The chart cannot be printed.": "لا يمكن طباعة الرسم.",
  "Differences between bars look larger than the actual gaps.":
    "تبدو الفروق بين الأعمدة أكبر من الفجوات الحقيقية.",
  "The rates stop being percentages.": "تكفّ النسب عن كونها نسبًا مئوية.",
  "The axis may only use whole numbers.": "لا يجوز أن يستخدم المحور إلا أعدادًا صحيحة.",
  "People who completed a course were promoted more often than people who did not enroll. What is missing before treating the course as the cause?":
    "مَن أتمّوا دورةً رُقّوا أكثر ممن لم يلتحقوا بها. ما الناقص قبل اعتبار الدورة هي السبب؟",
  "A comparison that accounts for how people were selected into the course.":
    "مقارنة تراعي طريقة اختيار الملتحقين بالدورة.",
  "A longer course title.": "عنوان أطول للدورة.",
  "Only the instructor's years of experience.": "سنوات خبرة المدرّب فقط.",
  "A certificate logo.": "شعار الشهادة.",
  "Write a SQL query that returns one row per region with the number of open tickets. Use tickets(id, opened_at, status, region).":
    "اكتب استعلام SQL يعيد صفًا واحدًا لكل منطقة مع عدد التذاكر المفتوحة. استخدم tickets(id, opened_at, status, region).",
  "The open-ticket count doubled after you joined tickets to agents on region. Agents can include more than one person in a region. What happened, and what would you change?":
    "تضاعف عدد التذاكر المفتوحة بعد ربط التذاكر بالموظفين على المنطقة. قد تضم المنطقة أكثر من موظف. ماذا حدث، وماذا تغيّر؟",
  "The join is many agents to one region. The question is about tickets, not agent rows.":
    "الربط يقابل عدة موظفين بمنطقة واحدة. السؤال عن التذاكر، لا عن صفوف الموظفين.",
  "A director asks for export to PDF on the learner dashboard. Describe the user, the problem, and the riskiest assumption before any build decision.":
    "يطلب مدير إضافة تصدير إلى PDF في لوحة المتعلّم. صف المستخدم والمشكلة وأشد الافتراضات مخاطرة قبل أي قرار بناء.",
  "Name one metric you would not use for this request, and say why.":
    "سمِّ مقياسًا واحدًا لن تستخدمه لهذا الطلب، واذكر السبب.",
  "A formula copied down a column keeps changing the tax-rate cell. What is the usual fix?":
    "معادلة منسوخة إلى أسفل العمود تغيّر خلية نسبة الضريبة باستمرار. ما الإصلاح المعتاد؟",
  "Delete the tax-rate cell.": "احذف خلية نسبة الضريبة.",
  "Lock the tax-rate reference so the copy does not move it.":
    "ثبّت مرجع خلية الضريبة حتى لا يتحرك عند النسخ.",
  "Convert the tax rate to text.": "حوّل نسبة الضريبة إلى نص.",
  "Sort the column first.": "رتّب العمود أولًا.",
  "A lookup returns a match for the wrong site because two site codes differ by a trailing space. What should the audit do first?":
    "تعيد دالة البحث تطابقًا للموقع الخطأ لأن رمزي موقع يختلفان بمسافة في الآخر. ماذا تفعل المراجعة أولًا؟",
  "Hide the column.": "أخفِ العمود.",
  "Increase the font size.": "كبّر حجم الخط.",
  "Compare the stored codes, including spaces, before trusting the match.":
    "قارن الرموز المخزّنة، بما فيها المسافات، قبل الوثوق بالتطابق.",
  "Replace the lookup with a colour scale.": "استبدل دالة البحث بتدرج لوني.",
  "A team finishes every sprint commitment, but stakeholders still say they are surprised. What is the most useful first explanation?":
    "ينهي الفريق كل التزامات السبرنت، لكن أصحاب المصلحة يقولون إنهم ما زالوا متفاجئين. ما أول تفسير مفيد؟",
  "The team needs more story points.": "الفريق يحتاج إلى نقاط قصص أكثر.",
  "Work is finishing without a shared understanding of the outcome.":
    "العمل يكتمل من غير فهم مشترك للناتج.",
  "The sprint must be changed to two weeks.": "يجب تغيير السبرنت إلى أسبوعين.",
  "Stakeholders should stop attending the review.": "يجب أن يتوقف أصحاب المصلحة عن حضور المراجعة.",
  "Mid-sprint, a director adds a story and calls it a must-ship for this sprint. What should the team do first?":
    "في منتصف السبرنت يضيف مدير قصة ويصفها بأنها واجبة الإصدار في هذا السبرنت. ماذا يفعل الفريق أولًا؟",
  "The sprint already has a goal.": "للسبرنت هدف محدد من قبل.",
  "Assessment Design Required. This course has a Course Completion record only. No validated competency assessment exists yet, so a proof 180 Certificate cannot be issued.":
    "تصميم التقييم مطلوب. لهذه الدورة Course Completion record فقط. لا يوجد تقييم كفاءة معتمد بعد، لذلك لا يمكن إصدار proof 180 Certificate.",
  "Not Yet Eligible. This completion belongs to a course version that does not have this assessment. Finishing an older version does not qualify the learner for a newer assessment, and the historical record is unchanged.":
    "غير مؤهل بعد. هذا الإتمام لنسخة لا تتضمن هذا التقييم. إنهاء النسخة الأقدم لا يؤهل المتعلّم لتقييم النسخة الأحدث، والسجل التاريخي يبقى كما هو.",
  "Separate association from causation": "افصل الارتباط عن السببية",
  "State a count change and a percent change correctly": "اذكر تغيّر العدد وتغيّر النسبة بشكل صحيح",
  "Recognize a truncated axis": "تعرّف على محور مبتور",
  "Name the missing comparison in a success story": "سمِّ المقارنة الناقصة في قصة النجاح",
  "Count open tickets by region": "عدّ التذاكر المفتوحة حسب المنطقة",
  "Explain a doubled count after a join": "اشرح تضاعف العدد بعد الربط",
  "Separate the user problem from the requested feature": "افصل مشكلة المستخدم عن الميزة المطلوبة",
  "Name a metric that would not answer the question": "سمِّ مقياسًا لا يجيب عن السؤال",
  "State the decision, the reason, and the ask": "اذكر القرار والسبب والطلب",
  "Use a formula": "استخدم معادلة",
  "Build a table": "أنشئ جدولًا",
  "Read a basic chart": "اقرأ رسمًا بيانيًا بسيطًا",
  "Choose an absolute or relative reference": "اختر مرجعًا مطلقًا أو نسبيًا",
  "Audit a lookup mismatch": "راجع عدم تطابق دالة البحث",
  "Explain a sprint goal": "اشرح هدف السبرنت",
  "Name the trade in a new request": "سمِّ التنازل في الطلب الجديد",
  "Keyed questions covering the four version 1 objectives.": "أسئلة بمفاتيح تغطي أهداف النسخة الأولى الأربعة.",
  "The response asks for a count of open tickets by region.": "الإجابة تطلب عدد التذاكر المفتوحة حسب المنطقة.",
  "The response explains the duplicated grain and a correction.": "الإجابة تشرح تكرار المستوى وطريقة التصحيح.",
  "The response names a user, a problem, and an assumption.": "الإجابة تسمّي مستخدمًا ومشكلة وافتراضًا.",
  "The response names a metric it would not use and why.": "الإجابة تسمّي مقياسًا لن تستخدمه وتذكر السبب.",
  "Keyed questions for the version 2 objectives.": "أسئلة بمفاتيح لأهداف النسخة الثانية.",
  "The response distinguishes an outcome from a task list and reads the stakeholder gap.":
    "الإجابة تميّز الناتج عن قائمة المهام وتقرأ فجوة أصحاب المصلحة.",
  "The response names the sprint goal and a trade.": "الإجابة تسمّي هدف السبرنت والتنازل.",
  "Four questions on claims, changes, and charts from the course objectives.":
    "أربعة أسئلة عن الادعاءات والتغيّرات والرسوم من أهداف الدورة.",
  "A short query and a scenario about a join that doubles a count.":
    "استعلام قصير وموقف عن ربط يضاعف العدد.",
  "A practical response to a request for PDF export on a learner dashboard.":
    "إجابة عملية على طلب تصدير PDF في لوحة المتعلّم.",
  "Two questions on version 2 objectives. Version 1 completions are not eligible.":
    "سؤالان عن أهداف النسخة الثانية. إتمام النسخة الأولى غير مؤهل.",
  "A quiz and two written answers. Optional tab-visibility signals may be recorded. This is not camera or screen monitoring.":
    "اختبار وإجابتان مكتوبتان. قد تُسجَّل إشارات إخفاء الصفحة اختياريًا. هذا ليس مراقبة بالكاميرا أو للشاشة.",
  demonstrated: "أُثبتت",
  "not demonstrated": "لم تُثبت",
  partial: "جزئي",
  pass: "نجاح",
  fail: "عدم النجاح",
  "Text checks look for explicit expected elements. That rule is a demo heuristic, not a validated measure of mastery.":
    "يفحص النص وجود العناصر المتوقعة صراحة. هذه قاعدة تجريبية، وليست مقياسًا معتمدًا للإتقان.",
  "Extended time (1.5x) is recorded as a sample accessibility accommodation. It is not a medical record.":
    "الوقت الإضافي (مرة ونصف) مسجّل كمثال على تيسير الوصول. وهو ليس سجلًا طبيًا.",
  visibility_hidden: "إخفاء الصفحة",
  approve: "موافقة",
  reject: "رفض",
  return: "إعادة",
};

function translateDynamic(text: string): string | null {
  const score = text.match(
    /^A score of (\d+)% or higher is an unvalidated passing hypothesis, not a calibrated standard\.$/,
  );
  if (score) {
    return `درجة ${score[1]}% أو أعلى فرضية نجاح غير معتمدة، وليست معيارًا مُعايَرًا.`;
  }
  const quiz = text.match(/^Quiz score (\d+)% compared with the unvalidated hypothesis of (\d+)%\.$/);
  if (quiz) {
    return `درجة الاختبار ${quiz[1]}% مقارنة بفرضية غير معتمدة قدرها ${quiz[2]}%.`;
  }
  const proposal = text.match(
    /^Demo evaluator proposed (pass|fail)\. (.+) This proposal cannot issue a proof 180 Certificate\.$/,
  );
  if (proposal) {
    const outcome = proposal[1] === "pass" ? "النجاح" : "عدم النجاح";
    const detail = ar[proposal[2]] ?? translateDynamic(proposal[2]) ?? proposal[2];
    return `اقترح المقيّم التجريبي ${outcome}. ${detail} هذا الاقتراح لا يصدر proof 180 Certificate.`;
  }
  return null;
}

export function phrase(locale: Locale, text: string | null | undefined): string {
  if (!text) return "";
  if (locale === "en") return text;
  if (ar[text]) return ar[text];
  const dynamic = translateDynamic(text);
  if (dynamic) return dynamic;
  if (text.includes(" — ") || text.includes("; ")) {
    return text
      .split("; ")
      .map((part) => {
        const bits = part.split(" — ");
        if (bits.length !== 2) return ar[part] ?? part;
        return `${ar[bits[0]] ?? bits[0]} — ${ar[bits[1]] ?? bits[1]}`;
      })
      .join("؛ ");
  }
  return text;
}
