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

                        // Troca o texto de forma invisível no meio do scroll
                        if (titleEl) {
                            if (p < 0.5) {
                                if (titleEl.getAttribute('data-stage') !== 'start') {
                                    titleEl.innerHTML = 'Sua clínica com <span class="text-gradient">Inteligência</span>';
                                    titleEl.setAttribute('data-stage', 'start');
                                }
                            } else {
                                if (titleEl.getAttribute('data-stage') !== 'end') {
                                    titleEl.innerHTML = 'Sua clínica com <span class="text-gradient">mais inteligência</span>';
                                    titleEl.setAttribute('data-stage', 'end');
                                }
                            }
                        }

                        // Lógica de Fade In/Out do Título único
                        let titleOpacity = 0;
                        let titleScale = 0.95;
                        let titleBlur = 10;

                        if (p < 0.2) {
                            titleOpacity = p / 0.2; // Fade in inicio
                            titleScale = 0.95 + (p / 0.2) * 0.05;
                            titleBlur = 10 - (p / 0.2) * 10;
                        } else if (p >= 0.2 && p < 0.3) {
                            titleOpacity = 1; // Mantém no inicio
                            titleScale = 1;
                            titleBlur = 0;
                        } else if (p >= 0.3 && p < 0.5) {
                            titleOpacity = 1 - (p - 0.3) / 0.2; // Fade out inicio
                            titleScale = 1 + ((p - 0.3) / 0.2) * 0.05;
                            titleBlur = ((p - 0.3) / 0.2) * 10;
                        } else if (p >= 0.7) {
                            const prog = Math.min((p - 0.7) / 0.3, 1);
                            titleOpacity = prog; // Fade in brilhante no final
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
                            vignette.style.opacity = titleOpacity * 0.6;
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
})();
