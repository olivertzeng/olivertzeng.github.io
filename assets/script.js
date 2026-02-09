const AUTH_WORKER_URL = "https://personal.oliver-tzeng.workers.dev";

function getCurrentLanguage() {
	return localStorage.getItem("preferredLanguage") || "en";
}

function setLanguage(lang) {
	if (typeof translations === "undefined" || !translations[lang]) return;

	document.querySelectorAll("[data-i18n-key]").forEach((element) => {
		const key = element.getAttribute("data-i18n-key");
		if (translations[lang][key]) {
			element.textContent = translations[lang][key];
		}
	});

	const pwdInput = document.getElementById("password-input");
	if (pwdInput) {
		pwdInput.placeholder = translations[lang].passwordPrompt || "Password...";
	}

	localStorage.setItem("preferredLanguage", lang);

	document.querySelectorAll(".lang-switcher button").forEach((button) => {
		const btnLang = button.getAttribute("onclick").match(/'(.*?)'/)[1];
		button.classList.toggle("active", btnLang === lang);
	});
}

function copyCode() {
	const codeElement = document.getElementById("code-to-copy");
	const copyButton = document.getElementById("copy-btn");
	const currentLang = getCurrentLanguage();
	const t = translations[currentLang];

	navigator.clipboard
		.writeText(codeElement.innerText)
		.then(() => {
			copyButton.textContent = t.copiedBtn;
			setTimeout(() => {
				copyButton.textContent = t.copyBtn;
			}, 2000);
		})
		.catch(console.error);
}

function toggleMoreSocials() {
	const grid = document.getElementById("more-links-grid");
	grid.classList.toggle("hidden");
}

function openAuthModal() {
	const servicesCard = document.getElementById("services-card");
	if (!servicesCard.classList.contains("hidden")) return;

	document.getElementById("password-modal").classList.add("visible");
	document.getElementById("password-input").value = "";
	document.getElementById("password-input").focus();
}

function closeAuthModal() {
	document.getElementById("password-modal").classList.remove("visible");
}

async function submitAuth() {
	const input = document.getElementById("password-input");
	const password = input.value;
	const currentLang = getCurrentLanguage();
	const t = translations[currentLang];
	const submitBtn = document.getElementById("modal-submit");
	const servicesCard = document.getElementById("services-card");
	const unlockBtn = document.getElementById("unlock-btn");

	if (!password) return;

	submitBtn.disabled = true;
	submitBtn.style.opacity = "0.6";

	try {
		const response = await fetch(AUTH_WORKER_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password: password }),
		});

		const data = await response.json();

		if (response.ok && data.success) {
			servicesCard.classList.remove("hidden");
			unlockBtn.style.display = "none";
			closeAuthModal();
		} else {
			alert(t.passwordIncorrect);
		}
	} catch (error) {
		console.error("Auth Error:", error);
		alert(t.errorOccurred);
	} finally {
		submitBtn.disabled = false;
		submitBtn.style.opacity = "1";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const savedLang = localStorage.getItem("preferredLanguage");
	let initialLang = "en";

	if (savedLang) {
		initialLang = savedLang;
	} else {
		const browserLang = navigator.language || navigator.userLanguage;
		if (browserLang.startsWith("zh-TW")) initialLang = "zh-TW";
		else if (browserLang.startsWith("zh-CN") || browserLang.startsWith("zh"))
			initialLang = "zh-CN";
	}

	setLanguage(initialLang);

	document
		.getElementById("unlock-btn")
		.addEventListener("click", openAuthModal);
	document
		.getElementById("more-links-btn")
		.addEventListener("click", toggleMoreSocials);
	document
		.getElementById("modal-cancel")
		.addEventListener("click", closeAuthModal);
	document.getElementById("modal-submit").addEventListener("click", submitAuth);
	document.getElementById("copy-btn").addEventListener("click", copyCode);

	document
		.getElementById("password-input")
		.addEventListener("keypress", (e) => {
			if (e.key === "Enter") submitAuth();
		});
});
