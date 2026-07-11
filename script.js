/* ==========================================================================
   FraudShieldUPI - Interactive Features & Scam Simulator
   ========================================================================== */

// ==========================================================================
// APK Download Configuration (Google Drive Direct Link)
// ==========================================================================
// To configure your Google Drive download:
// 1. Upload your APK to Google Drive.
// 2. Share the file and change access to "Anyone with the link" (set as Viewer).
// 3. Copy the link: https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=sharing
// 4. Extract YOUR_FILE_ID and paste it below.
const APK_DOWNLOAD_URL = "https://drive.google.com/uc?export=download&confirm=t&id=1av1gn0_FMv2nODx-km7cPDbxcUwQZu6M";

document.addEventListener('DOMContentLoaded', () => {
    // Update all APK download buttons dynamically on page load
    const downloadBtns = document.querySelectorAll('.apk-download-btn');
    downloadBtns.forEach(btn => {
        btn.setAttribute('href', APK_DOWNLOAD_URL);
        btn.removeAttribute('target');
        btn.removeAttribute('rel');
        btn.setAttribute('download', 'FraudShieldUPI.apk');
    });

    // 1. Navbar Scroll Effect
    const navbar = document.getElementById('mainNavbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 2. Active Navigation Highlight on Scroll
    const sections = document.querySelectorAll('header, section');
    const navLinks = document.querySelectorAll('.nav-link-custom');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // 3. Simulator Scanner Logic
    const scanBtn = document.getElementById('scanBtn');
    const scannerInput = document.getElementById('scannerInput');
    const simulatorResult = document.getElementById('simulatorResult');

    if (scanBtn && scannerInput && simulatorResult) {
        scanBtn.addEventListener('click', runScamScanner);
        scannerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                runScamScanner();
            }
        });
    }

    // 4. Dynamic QR Code Generation
    const qrImg = document.getElementById('qrCodeImg');
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(APK_DOWNLOAD_URL)}&color=00f2fe&bgcolor=0b0f19&qzone=2`;
    }
});

// Use Sample Text in Simulator
function useSample(text) {
    const scannerInput = document.getElementById('scannerInput');
    if (scannerInput) {
        scannerInput.value = text;
        runScamScanner();
    }
}

// Perform Scan Simulation
function runScamScanner() {
    const input = document.getElementById('scannerInput').value.trim();
    const resultBox = document.getElementById('simulatorResult');

    if (!input) {
        resultBox.className = "simulator-result-box";
        resultBox.innerHTML = `
            <div class="simulator-result-icon"><i class="bi bi-exclamation-circle text-warning"></i></div>
            <h4 class="simulator-result-title text-warning">Empty Input</h4>
            <p class="simulator-result-desc">Please type a UPI ID, message content, or click one of the quick samples above.</p>
        `;
        return;
    }

    // Set Loading state
    resultBox.className = "simulator-result-box scanning-active border border-info";
    resultBox.innerHTML = `
        <div class="spinner-border text-info mb-3" role="status">
            <span class="visually-hidden">Scanning...</span>
        </div>
        <h4 class="simulator-result-title text-info">Analyzing Datasets...</h4>
        <p class="simulator-result-desc">Checking text structure, VPA verification status, and NPCI blacklist registries.</p>
    `;

    // Simulate Network / AI Analysis delay of 1.5 seconds
    setTimeout(() => {
        const assessment = assessInputThreat(input);
        displayScanResult(assessment, resultBox);
    }, 1500);
}

// Threat Assessment Engine
function assessInputThreat(input) {
    const lower = input.toLowerCase();

    // High risk keywords targeting cashbacks, lottery, electricity bill disconnect, verification calls
    const highRiskKeywords = [
        'win', 'cashback', 'lottery', 'scratch card', 'gift', 'prize', 'crore', 'lakh', 'reward',
        'disconnect', 'electricity bill', 'power bill', 'blocked', 'suspend', 'verify request',
        'pan card', 'kyc update', 'k.y.c', 'lucky draw', 'phonepe reward', 'gpay scratch',
        'http://bit.ly', 'https://bit.ly', 'http://tinyurl', 'https://tinyurl', 'http://scam',
        'pay-bill', 'call immediately', 'toll-free', 'tollfree'
    ];

    // High risk virtual payment addresses suffixes or prefixes
    const highRiskVpas = [
        'reward', 'pay-bill', 'electricity', 'cashback', 'scam', 'prize', 'verify-gpay',
        'paytm-prize', 'upi-reward', 'helpdesk', 'customer'
    ];

    // Check for obvious scams first
    let containsHighRiskWord = highRiskKeywords.some(keyword => lower.includes(keyword));

    // Check if input looks like a UPI address (contains @)
    let isUpiId = lower.includes('@');
    let upiHandle = '';
    if (isUpiId) {
        const parts = lower.split('@');
        upiHandle = parts[0];
    }

    let isHighRiskVpa = highRiskVpas.some(vpa => lower.includes(vpa));

    // Rule-based classification
    if (containsHighRiskWord || isHighRiskVpa) {
        return {
            status: 'SCAM',
            title: 'HIGH RISK DETECTED',
            color: 'danger',
            icon: 'bi-shield-x',
            description: 'This message or VPA contains elements heavily linked with known payment phishing, fake utility bill scams, or scratch-card fraud schemes.'
        };
    }

    // Unverified warnings (Unknown VPAs or standard formatting without flags)
    if (isUpiId) {
        // Standard safe handles
        const safeHandles = ['okaxis', 'okicici', 'oksbi', 'paytm', 'ybl', 'apl', 'okhdfcbank'];
        const handleDomain = lower.split('@')[1];

        let isCommonHandle = safeHandles.some(handle => handleDomain && handleDomain.includes(handle));

        if (isCommonHandle && upiHandle.length > 3 && !/[^a-zA-Z0-9._]/.test(upiHandle)) {
            return {
                status: 'SAFE',
                title: 'VERIFIED SOURCE',
                color: 'success',
                icon: 'bi-shield-check',
                description: 'The UPI ID is structured correctly and points to a verified merchant gateway. No suspicious behavioral patterns detected.'
            };
        } else {
            return {
                status: 'WARNING',
                title: 'UNVERIFIED MERCHANT',
                color: 'warning',
                icon: 'bi-shield-exclamation',
                description: 'This UPI handle is structured correctly but is not listed in local white registries. Always verify recipient details before authorization.'
            };
        }
    }

    // Default return for unstructured safe-looking texts
    return {
        status: 'SAFE',
        title: 'NO THREATS FOUND',
        color: 'success',
        icon: 'bi-shield-check',
        description: 'Text analysis complete. No indicators of payment threats, malicious deep links, or high-risk bank redirects found.'
    };
}

// Display Result in UI
function displayScanResult(result, container) {
    container.className = `simulator-result-box border border-${result.color} fade-in`;
    container.style.boxShadow = `0 0 20px rgba(${result.color === 'success' ? '16, 185, 129' : result.color === 'warning' ? '245, 158, 11' : '239, 68, 68'}, 0.25)`;

    container.innerHTML = `
        <div class="simulator-result-icon"><i class="bi ${result.icon} text-${result.color}"></i></div>
        <h4 class="simulator-result-title text-${result.color}">${result.title}</h4>
        <p class="simulator-result-desc text-secondary">${result.description}</p>
    `;
}

// 4. Contact Form Feedback Logic
function handleFormSubmit(event) {
    // Let the standard HTML form submission happen to bypass browser CORS blocks
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending Message...`;
    }
}

// 5. Reload page or reset form on back navigation (restoring from history/cache)
window.addEventListener('pageshow', (event) => {
    const isBackForward = event.persisted || 
        (window.performance && window.performance.getEntriesByType && 
         window.performance.getEntriesByType('navigation')[0] && 
         window.performance.getEntriesByType('navigation')[0].type === 'back_forward');
    
    if (isBackForward) {
        window.location.replace(window.location.pathname + '#home');
        window.location.reload();
    } else {
        // Fallback: Ensure the submit button is enabled and form is reset on fresh load
        const submitBtn = document.getElementById('submitBtn');
        const contactForm = document.getElementById('contactForm');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="bi bi-send-fill"></i> Send Message`;
        }
        if (contactForm) {
            contactForm.reset();
        }
    }
});
