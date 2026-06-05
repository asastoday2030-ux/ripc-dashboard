// ============ RIPC AI Chat - Gemini Integration ============

const RIPC_SYSTEM_PROMPT = `أنت مساعد ذكي متخصص في أنظمة ولوائح مركز مشاريع البنية التحتية بمنطقة الرياض (RIPC).
يجب أن تجيب فقط على الأسئلة المتعلقة بـ RIPC وأنظمته ولوائحه وإجراءاته ومخالفاته وغراماته.

المعلومات الرئيسية التي تعرفها:

=== السند النظامي ===
قرار مجلس الوزراء رقم 902 تاريخ 30/12/1444هـ

=== تصنيف المخالفات ===
1. مخالفات حرجة: غرامة 50,000 - 100,000 ريال + إيقاف فوري + إحالة قانونية
2. مخالفات جسيمة: غرامة 10,000 - 50,000 ريال + إيقاف العمل
3. مخالفات متوسطة: غرامة 4,000 - 10,000 ريال + مهلة تصحيحية
4. مخالفات غير جسيمة: غرامة 1,000 - 4,000 ريال + إنذار أولاً
5. مخالفات بسيطة: غرامة 500 - 2,000 ريال + توجيه

=== أبرز المخالفات والغرامات ===
- العمل بدون ترخيص: 50,000 ريال + إيقاف فوري + إحالة قانونية (حرجة)
- إتلاف خطوط الخدمات: 100,000 ريال + تعويض كامل (حرجة)
- تشغيل مقاول غير معتمد: 50,000 ريال + إيقاف (حرجة)
- تشغيل مكتب استشاري غير مرخص: 40,000 ريال (حرجة)
- الاستمرار بعد انتهاء الترخيص: 25,000 ريال + إيقاف (جسيمة)
- استخدام الترخيص في أعمال غير محددة: 30,000 ريال (جسيمة)
- إغلاق الطريق بدون موافقة: 20,000 ريال (جسيمة)
- الحفر بالقرب من خطوط الخدمات بدون تنسيق: 20,000 ريال (جسيمة)
- تجاوز أبعاد الحفر: 15,000 ريال (جسيمة)
- عدم إعادة السفلتة حسب المواصفات: 20,000 ريال (جسيمة)
- عدم الالتزام بإشعارات الإيقاف: 50,000 × 3 + إحالة (حرجة)
- عدم وضع اللوحات التحذيرية: 5,000 ريال + مهلة 48 ساعة (متوسطة)
- عدم تركيب إنارة الليل: 10,000 ريال (جسيمة)
- ضعف نظافة الموقع: 2,000 ريال + إنذار (غير جسيمة)
- تخزين المواد خارج النطاق: 5,000 ريال (متوسطة)

=== مبدأ التدرج في العقوبات ===
- المخالفة غير الجسيمة أول مرة: إنذار + مهلة تصحيح
- عدم الامتثال: غرامة بالحد الأدنى
- التكرار خلال السنة: مضاعفة الغرامة
- التكرار الثالث: إيقاف مؤقت
- الاستمرار: إلغاء الترخيص + إحالة قانونية

=== إجراءات الترخيص ===
المدة الإجمالية: 12 - 25 يوم عمل
1. تقديم الطلب (1-3 أيام)
2. المراجعة الفنية (3-7 أيام)
3. التنسيق مع الجهات عبر منصة نسق (3-10 أيام)
4. إصدار الترخيص (1-2 يوم)
المتطلبات: سجل تجاري + خرائط + اعتماد مقاول ومختبر واستشاري + تأمين

=== الاعتراض والتظلم ===
- يحق لصاحب المخالفة الاعتراض خلال 30 يوم من إشعار المخالفة
- يُقدَّم الاعتراض إلكترونياً عبر موقع RIPC
- تُراجعه لجنة مختصة خلال 15 يوم عمل
- يمكن التقاضي الإداري عند الرفض

=== الخدمات الإلكترونية ===
- إصدار التراخيص
- تجديد التراخيص
- الاستعلام عن المخالفات
- تقديم الاعتراضات
- رفع البلاغات
الموقع: ripc.gov.sa

=== الاشتراطات الأساسية ===
- اعتماد المقاول لدى RIPC قبل البدء
- اعتماد الاستشاري الإشرافي
- اعتماد المختبر المعتمد
- التنسيق عبر منصة نسق
- خطة السلامة المرورية
- التأمين الشامل على المشروع

أجب دائماً باللغة التي يكتب بها المستخدم (عربي أو إنجليزي).
كن دقيقاً ومهنياً واستشهد بالمادة النظامية عند الإمكان.
إذا سُئلت عن شيء خارج نطاق RIPC، اعتذر بلطف وأشر إلى أن تخصصك في RIPC فقط.`;

let geminiApiKey = localStorage.getItem('ripc_gemini_key') || '';
let chatHistory = [];
let isTyping = false;

function initAIChat() {
  const savedKey = localStorage.getItem('ripc_gemini_key');
  if (savedKey) {
    geminiApiKey = savedKey;
    document.getElementById('ai-api-key')?.setAttribute('value', savedKey);
  }
  renderWelcomeMessage();
}

function saveApiKey() {
  const keyInput = document.getElementById('ai-api-key');
  if (keyInput && keyInput.value.trim()) {
    geminiApiKey = keyInput.value.trim();
    localStorage.setItem('ripc_gemini_key', geminiApiKey);
    showToast(currentLang === 'ar' ? '✅ تم حفظ مفتاح API' : '✅ API key saved');
    document.getElementById('ai-config-panel')?.classList.add('hidden');
    document.getElementById('ai-chat-main')?.classList.remove('hidden');
  }
}

function renderWelcomeMessage() {
  const messagesDiv = document.getElementById('ai-messages');
  if (!messagesDiv) return;
  const welcome = currentLang === 'ar'
    ? 'مرحباً! أنا المساعد الذكي لمركز RIPC. يمكنني الإجابة على أسئلتك حول المخالفات والغرامات وإجراءات الترخيص والأنظمة واللوائح والاعتراضات. كيف يمكنني مساعدتك؟'
    : 'Hello! I\'m the RIPC AI Assistant. I can answer your questions about violations, fines, licensing procedures, regulations, and appeals. How can I help you?';

  messagesDiv.innerHTML = `
    <div class="ai-message bot-message">
      <div class="ai-avatar">🤖</div>
      <div class="ai-bubble">${welcome}</div>
    </div>
  `;
  chatHistory = [];
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  if (!input || !input.value.trim() || isTyping) return;

  const userMsg = input.value.trim();
  input.value = '';

  // Check API key
  if (!geminiApiKey) {
    document.getElementById('ai-config-panel')?.classList.remove('hidden');
    document.getElementById('ai-chat-main')?.classList.add('hidden');
    return;
  }

  appendMessage('user', userMsg);
  chatHistory.push({ role: 'user', parts: [{ text: userMsg }] });

  showTypingIndicator();

  try {
    const response = await callGeminiAPI(userMsg);
    hideTypingIndicator();
    appendMessage('bot', response);
    chatHistory.push({ role: 'model', parts: [{ text: response }] });
  } catch (err) {
    hideTypingIndicator();
    const errMsg = currentLang === 'ar'
      ? `⚠️ حدث خطأ في الاتصال: ${err.message}. تأكد من صحة مفتاح API.`
      : `⚠️ Connection error: ${err.message}. Please verify your API key.`;
    appendMessage('bot', errMsg);
  }
}

async function callGeminiAPI(userMessage) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

  // Build context from history (last 6 messages)
  const recentHistory = chatHistory.slice(-6);

  const requestBody = {
    system_instruction: {
      parts: [{ text: RIPC_SYSTEM_PROMPT }]
    },
    contents: [
      ...recentHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      topP: 0.8
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 
    (currentLang === 'ar' ? 'لم أتمكن من الحصول على إجابة. حاول مرة أخرى.' : 'Unable to get a response. Please try again.');
}

function appendMessage(role, text) {
  const messagesDiv = document.getElementById('ai-messages');
  if (!messagesDiv) return;

  const div = document.createElement('div');
  div.className = `ai-message ${role === 'user' ? 'user-message' : 'bot-message'}`;

  // Convert newlines and markdown-like formatting
  const formattedText = text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/•/g, '&bull;');

  div.innerHTML = role === 'user'
    ? `<div class="ai-bubble user-bubble">${formattedText}</div><div class="ai-avatar user-av">👤</div>`
    : `<div class="ai-avatar">🤖</div><div class="ai-bubble">${formattedText}</div>`;

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showTypingIndicator() {
  isTyping = true;
  const messagesDiv = document.getElementById('ai-messages');
  if (!messagesDiv) return;
  const div = document.createElement('div');
  div.className = 'ai-message bot-message';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="ai-avatar">🤖</div><div class="ai-bubble typing-bubble"><span></span><span></span><span></span></div>`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function hideTypingIndicator() {
  isTyping = false;
  document.getElementById('typing-indicator')?.remove();
}

function clearChat() {
  chatHistory = [];
  renderWelcomeMessage();
}

function toggleConfigPanel() {
  const panel = document.getElementById('ai-config-panel');
  const main = document.getElementById('ai-chat-main');
  if (panel) panel.classList.toggle('hidden');
  if (main) main.classList.toggle('hidden');
}

// Quick questions
function askQuestion(question) {
  const input = document.getElementById('ai-input');
  if (input) {
    input.value = question;
    sendAIMessage();
  }
}

// Handle Enter key in chat inputs
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (document.activeElement?.id === 'ai-input') {
      sendAIMessage();
    } else if (document.activeElement?.id === 'dashboard-ai-input') {
      askDashboardAI();
    }
  }
});

// ========================== DASHBOARD QUICK ASK LOGIC ==========================
async function askDashboardAI(forcedQuery = '') {
  const inputEl = document.getElementById('dashboard-ai-input');
  const responseBox = document.getElementById('dashboard-ai-response');
  const responseContent = document.getElementById('dashboard-ai-response-content');
  
  if (!inputEl || !responseBox || !responseContent) return;
  
  let query = forcedQuery || inputEl.value.trim();
  if (!query) return;
  
  // Show response box with loading indicator
  responseBox.style.display = 'block';
  responseContent.innerHTML = `
    <div class="ai-ask-loading">
      <span class="ai-ask-spinner"></span>
      <span>جاري التفكير والبحث في الأنظمة...</span>
    </div>
  `;
  
  // Clear input if query was typed
  if (!forcedQuery) inputEl.value = '';
  else inputEl.value = query;

  // Check API key
  if (!geminiApiKey) {
    responseContent.innerHTML = `
      <div style="color: var(--red); font-weight: bold; margin-bottom: 10px;">
        🔑 لم يتم إعداد مفتاح Gemini API بعد.
      </div>
      <p style="font-size: 12.5px; margin-bottom: 12px;">يرجى إدخال مفتاح Gemini API الخاص بك لتتمكن من استخدام المساعد الذكي:</p>
      <div class="acp-config-row" style="max-width: 420px; display: flex; gap: 8px;">
        <input type="password" id="dashboard-api-key" placeholder="أدخل مفتاح Gemini API هنا..." style="flex: 1; background: var(--bg3); border: 1px solid var(--bdr2); border-radius: 8px; padding: 9px 12px; color: var(--txt); font-family: inherit; font-size: 12px; outline: none;" />
        <button onclick="saveDashboardApiKey()" style="background: var(--green); color: white; border: none; padding: 9px 14px; border-radius: 8px; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer;">حفظ</button>
      </div>
      <p style="font-size: 11px; margin-top: 10px; color: var(--txt3);">يمكنك الحصول على مفتاح مجاني من <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: var(--green); text-decoration: underline;">aistudio.google.com ↗</a></p>
    `;
    return;
  }

  try {
    const response = await callGeminiAPI(query);
    
    // Format markdown-like formatting in response
    const formattedText = response
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/•/g, '&bull;');
      
    responseContent.innerHTML = `
      <div class="ai-response-text">${formattedText}</div>
    `;
  } catch (err) {
    responseContent.innerHTML = `
      <div style="color: var(--red); font-weight: bold;">
        ⚠️ حدث خطأ في الاتصال: ${err.message}
      </div>
      <p style="font-size: 12px; color: var(--txt3); margin-top: 5px;">تأكد من صحة مفتاح API ومن اتصالك بالإنترنت.</p>
    `;
  }
}

function closeDashboardResponse() {
  const responseBox = document.getElementById('dashboard-ai-response');
  if (responseBox) responseBox.style.display = 'none';
}

function saveDashboardApiKey() {
  const keyInput = document.getElementById('dashboard-api-key');
  if (keyInput && keyInput.value.trim()) {
    geminiApiKey = keyInput.value.trim();
    localStorage.setItem('ripc_gemini_key', geminiApiKey);
    showToast(currentLang === 'ar' ? '✅ تم حفظ مفتاح API' : '✅ API key saved');
    
    // sync with floating chat key input if exists
    const floatKeyInput = document.getElementById('ai-api-key');
    if (floatKeyInput) floatKeyInput.value = geminiApiKey;
    
    // Re-run the question
    const inputEl = document.getElementById('dashboard-ai-input');
    if (inputEl && inputEl.value.trim()) {
      askDashboardAI();
    } else {
      const responseContent = document.getElementById('dashboard-ai-response-content');
      if (responseContent) responseContent.innerHTML = '<span style="color: var(--green);">تم حفظ المفتاح! اكتب سؤالك واضغط على "إرسال الاستفسار"</span>';
    }
  }
}
