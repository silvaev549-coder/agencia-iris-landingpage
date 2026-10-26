(function () {
    'use strict';

    // Aguardar GSAP carregar
    function waitForGSAP(cb) {
        if (window.gsap && window.ScrollTrigger) {
            cb();
        } else {
            setTimeout(function () { waitForGSAP(cb); }, 50);
        }
    }

    waitForGSAP(function () {
        gsap.registerPlugin(ScrollTrigger);

        const canvas = document.getElementById('hero-canvas');
        const ctx = canvas.getContext('2d');
        const section = document.querySelector('.hero-scroll-section');
        const loader = document.getElementById('hero-loader');
        const scrollFill = document.getElementById('scroll-fill');
        const overlay = document.querySelector('.hero-scroll-overlay');
        const titleEl = document.querySelector('.hero-scroll-title');
        const subtitleEl = document.querySelector('.hero-scroll-subtitle');
        const progressEl = document.querySelector('.hero-scroll-progress');

        const frameCount = 104;
        const images = [];
        let loadedCount = 0;
        const currentFrame = { index: 0 };

        // Gerar caminho do frame
        function frameSrc(i) {
            const num = String(i).padStart(3, '0');
            return './frames/frame_' + num + '_delay-0.076s.jpg';
        }

        // Pré-carregar todas as imagens
        function preloadImages() {
            return new Promise(function (resolve) {
                for (let i = 0; i < frameCount; i++) {
                    const img = new Image();
                    img.src = frameSrc(i);
                    img.onload = function () {
                        loadedCount++;
                        if (loadedCount === frameCount) {
                            resolve();
                        }
                    };
                    img.onerror = function () {
                        loadedCount++;
                        if (loadedCount === frameCount) {
                            resolve();
                        }
                    };
                    images.push(img);
                }
            });
        }

        // Ajustar tamanho do canvas para a viewport
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawFrame(currentFrame.index);
        }

        // Desenhar o frame no canvas (cover)
        function drawFrame(index) {
            const img = images[index];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            // Simular object-fit: cover
            const scale = Math.max(cw / iw, ch / ih);
            const sw = iw * scale;
            const sh = ih * scale;
            const sx = (cw - sw) / 2;
            const sy = (ch - sh) / 2;

            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, sx, sy, sw, sh);
        }

        // Iniciar animação
        preloadImages().then(function () {
            // Esconder loader
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(function () { loader.style.display = 'none'; }, 500);
            }

            // Mostrar texto e indicador
            setTimeout(function () {
                if (titleEl) titleEl.classList.add('visible');
                if (subtitleEl) subtitleEl.classList.add('visible');
                if (progressEl) progressEl.classList.add('visible');
            }, 300);

            // Ajustar canvas
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);

            // Desenhar primeiro frame
            drawFrame(0);

            // GSAP ScrollTrigger — troca de frames
            gsap.to(currentFrame, {
                index: frameCount - 1,
                snap: 'index',
                ease: 'none',
                scrollTrigger: {
                    trigger: section,
                    start: 'top top',
                    end: 'bottom bottom',
                    scrub: 0.5,
                    onUpdate: function (self) {
                        drawFrame(Math.round(currentFrame.index));

                        // Atualizar barra de progresso
                        if (scrollFill) {
                            scrollFill.style.width = (self.progress * 100) + '%';
                        }

                        const p = self.progress;

                        // Lógica de Fade In/Out do Título único (Aparece aos 70%, some no final)
                        let titleOpacity = 0;
                        let titleScale = 0.95;
                        let titleBlur = 10;

                        if (p >= 0.7 && p <= 1.0) {
                            let prog = 0;
                            if (p < 0.85) {
                                prog = (p - 0.7) / 0.15; // Fade In (70% a 85%)
                            } else {
                                prog = 1; // Fica até o fim
                            }

                            titleOpacity = prog;
                            titleScale = 0.95 + (prog * 0.05);
                            titleBlur = 10 - (prog * 10);
                        }

                        if (titleEl) {
                            titleEl.style.opacity = titleOpacity;
                            titleEl.style.transform = 'translateY(' + (40 - titleOpacity * 40) + 'px) scale(' + titleScale + ')';
                            titleEl.style.filter = 'blur(' + titleBlur + 'px)';
                        }

                        // Vinheta aumenta junto com a opacidade do título para dar contraste
                        const vignette = document.getElementById('hero-vignette');
                        if (vignette) {
                            vignette.style.opacity = titleOpacity * 0.7; // Mais escura
                        }

                        // Esconder indicador de scroll após rolar um pouco
                        if (progressEl) {
                            progressEl.style.opacity = p < 0.05 ? '1' : '0';
                        }
                    }
                }
            });
        });
    });

    // ── FORMULÁRIO COM FEEDBACK VISUAL PREMIUM ──
    const form = document.querySelector('form[action^="https://formsubmit.co"]');
    if (form) {
        form.addEventListener('submit', function (e) {
            const btn = form.querySelector('button[type="submit"]');
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-spinner" style="animation: spin 1s linear infinite;"></i> Processando...';
                btn.style.opacity = '0.8';
                btn.style.pointerEvents = 'none';
                
                // O form será submetido normalmente pelo formsubmit, 
                // a animação ficará ativa até o redirecionamento.
            }
        });
    }

})();

// CSS para o spinner do botão
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

// ── EXIT INTENT ALGORITHM ──
document.addEventListener("DOMContentLoaded", () => {
    const exitPopup = document.getElementById("exit-popup");
    const closePopupBtn = document.getElementById("close-exit-popup");
    const btnExitPopup = document.getElementById("btn-exit-popup");
    let hasTriggered = false;

    if (exitPopup) {
        // Função para abrir
        const triggerPopup = () => {
            if (!hasTriggered && !sessionStorage.getItem("exitIntentShown")) {
                exitPopup.classList.add("active");
                hasTriggered = true;
                sessionStorage.setItem("exitIntentShown", "true");
            }
        };

        // Detectar saída do mouse (Desktop) - Ameaça real de fechamento
        document.addEventListener("mouseleave", (e) => {
            if (e.clientY <= 10) {
                triggerPopup();
            }
        });

        // Funções de fechar
        const closePopup = () => {
            exitPopup.classList.remove("active");
        };

        if (closePopupBtn) closePopupBtn.addEventListener("click", closePopup);
        if (btnExitPopup) btnExitPopup.addEventListener("click", closePopup);
        
        exitPopup.addEventListener("click", (e) => {
            if (e.target === exitPopup) {
                closePopup();
            }
        });
    }
});

// ── LGPD COOKIE CONSENT ──
document.addEventListener("DOMContentLoaded", () => {
    const cookieBanner = document.getElementById("cookie-banner");
    const acceptCookiesBtn = document.getElementById("accept-cookies");

    if (cookieBanner && acceptCookiesBtn) {
        // Verifica se o usuário já aceitou antes
        if (!localStorage.getItem("lgpd_consent")) {
            // Pequeno delay para a animação
            setTimeout(() => {
                cookieBanner.style.display = "flex";
                // Força reflow para ativar a transição
                cookieBanner.offsetHeight;
                cookieBanner.classList.add("active");
            }, 1000);
        }

        acceptCookiesBtn.addEventListener("click", () => {
            localStorage.setItem("lgpd_consent", "true");
            cookieBanner.classList.remove("active");
            
            // Aguarda a transição terminar antes de ocultar
            setTimeout(() => {
                cookieBanner.style.display = "none";
            }, 400);
        });
    }
});

// ── CAPTURA SILENCIOSA DE UTMS ──
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Mapeamento dos parâmetros UTM da URL para os IDs dos inputs ocultos
    const utmMapping = {
        'utm_source': 'utm_source',
        'utm_medium': 'utm_medium',
        'utm_campaign': 'utm_campaign'
    };

    // Preenche os inputs se a UTM existir na URL, senão busca se já existia salvo no sessionStorage de navegação prévia
    for (const [param, inputId] of Object.entries(utmMapping)) {
        const input = document.getElementById(inputId);
        if (input) {
            let utmValue = urlParams.get(param);
            if (utmValue) {
                input.value = utmValue;
                sessionStorage.setItem(param, utmValue);
            } else {
                let savedUtm = sessionStorage.getItem(param);
                if (savedUtm) {
                    input.value = savedUtm;
                }
            }
        }
    }
});


// ══════════════════════════════════════════════════════════════════════
// APPLE-STYLE LIVE WHATSAPP & CRM REALTIME SIMULATOR (ESG TECNOLOGIA)
// ══════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const waStream = document.getElementById("apple-wa-stream");
    const typing = document.getElementById("apple-wa-typing");
    const crmStage = document.querySelector(".crm-stage-pill");

    if (!waStream) return;

    const b1 = document.getElementById("wb-1");
    const b2 = document.getElementById("wb-2");
    const b3 = document.getElementById("wb-3");
    const b4 = document.getElementById("wb-4");
    const b5 = document.getElementById("wb-5");
    const b6 = document.getElementById("wb-6");

    const allBubbles = [b1, b2, b3, b4, b5, b6];

    function runChatAnimation() {
        // Reset all
        allBubbles.forEach(b => {
            if (b) {
                b.style.display = "none";
                b.style.opacity = "0";
                b.style.transform = "translateY(10px)";
            }
        });
        if (typing) typing.style.display = "none";
        if (crmStage) {
            crmStage.textContent = "Novo Lead";
            crmStage.style.background = "rgba(0, 184, 212, 0.2)";
            crmStage.style.color = "#00B8D4";
        }

        // Step 1: User message 1
        setTimeout(() => {
            if (b1) {
                b1.style.display = "block";
                b1.style.opacity = "1";
                b1.style.transform = "translateY(0)";
            }
        }, 500);

        // Step 2: Agent typing
        setTimeout(() => {
            if (typing) typing.style.display = "flex";
        }, 1600);

        // Step 3: Agent bubble 2
        setTimeout(() => {
            if (typing) typing.style.display = "none";
            if (b2) {
                b2.style.display = "block";
                b2.style.opacity = "1";
                b2.style.transform = "translateY(0)";
            }
        }, 2800);

        // Step 4: Agent bubble 3
        setTimeout(() => {
            if (b3) {
                b3.style.display = "block";
                b3.style.opacity = "1";
                b3.style.transform = "translateY(0)";
            }
        }, 3900);

        // Step 5: User response 4
        setTimeout(() => {
            if (b4) {
                b4.style.display = "block";
                b4.style.opacity = "1";
                b4.style.transform = "translateY(0)";
            }
        }, 5500);

        // Step 6: Agent typing again
        setTimeout(() => {
            if (typing) typing.style.display = "flex";
        }, 6800);

        // Step 7: Agent bubble 5
        setTimeout(() => {
            if (typing) typing.style.display = "none";
            if (b5) {
                b5.style.display = "block";
                b5.style.opacity = "1";
                b5.style.transform = "translateY(0)";
            }
        }, 8200);

        // Step 8: Agent closing CTA bubble 6
        setTimeout(() => {
            if (b6) {
                b6.style.display = "block";
                b6.style.opacity = "1";
                b6.style.transform = "translateY(0)";
            }
            if (crmStage) {
                crmStage.textContent = "Qualificado ★";
                crmStage.style.background = "rgba(16, 185, 129, 0.2)";
                crmStage.style.color = "#10B981";
            }
        }, 9600);
    }

    // Run on visibility
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            runChatAnimation();
            // Re-run periodically
            setInterval(runChatAnimation, 24000);
            observer.disconnect();
        }
    }, { threshold: 0.2 });

    observer.observe(waStream);
});

// ══════════════════════════════════════════════════════════════════════
// FORMULÁRIO DE AUDITORIA & MODAL DE SUCESSO APPLE STYLE
// ══════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-diagnostico");
    const modalSucesso = document.getElementById("modal-sucesso-apple");
    const btnFechar = document.getElementById("btn-fechar-sucesso");

    if (form && modalSucesso) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : "Enviar";

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = "Processando Diagnóstico...";
            }

            const formData = new FormData(form);
            const dataObj = {};
            formData.forEach((val, key) => dataObj[key] = val);

            try {
                // Envia de forma segura via FormSubmit AJAX (sem redirecionar a tela)
                await fetch("https://formsubmit.co/ajax/silvaevandro815@gmail.com", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify(dataObj)
                });

                // Abre o Modal Apple Style
                modalSucesso.classList.add("active");
                form.reset();
            } catch (err) {
                console.error("Erro ao submeter:", err);
                // Fallback: se falhar o AJAX, abre o modal mesmo assim para não frustrar o lead
                modalSucesso.classList.add("active");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            }
        });

        if (btnFechar) {
            btnFechar.addEventListener("click", () => {
                modalSucesso.classList.remove("active");
            });
        }

        modalSucesso.addEventListener("click", (e) => {
            if (e.target === modalSucesso) {
                modalSucesso.classList.remove("active");
            }
        });
    }
});
