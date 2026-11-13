(function () {
    "use strict";

    const app = document.querySelector(".app");
    const content = document.querySelector(".content");
    const sky = document.getElementById("ambient-sky");
    const canvas = document.getElementById("ambient-stars");

    if (!app || !content || !sky || !canvas || typeof canvas.getContext !== "function") return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const starColors = [
        [216, 225, 236],
        [143, 195, 238]
    ];
    const stars = [];
    let reducedMotion = motionPreference.matches;
    let width = 0;
    let height = 0;
    let frameId = null;
    let lastFrameTime = 0;
    let lastDrawTime = 0;
    let isInView = false;
    let isPageVisible = !document.hidden;

    function createStar() {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;

        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 0.6 + Math.random() * 0.9,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            opacity: 0.24 + Math.random() * 0.38,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.35 + Math.random() * 0.9,
            glow: Math.random() < 0.08
        };
    }

    function resize() {
        const rect = content.getBoundingClientRect();
        const previousWidth = width;
        const previousHeight = height;

        width = rect.width;
        height = rect.height;

        if (width < 1 || height < 1) return;

        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        stars.forEach(function (star) {
            if (previousWidth > 0 && previousHeight > 0) {
                star.x *= width / previousWidth;
                star.y *= height / previousHeight;
            } else {
                star.x = Math.random() * width;
                star.y = Math.random() * height;
            }
        });

        const targetCount = window.matchMedia("(max-width: 700px)").matches ? 65 : 120;
        while (stars.length < targetCount) stars.push(createStar());
        stars.length = targetCount;
        updateVisibility();
    }

    function moveStar(star, dt) {
        const speedScale = reducedMotion ? 0.35 : 1;
        star.x += star.vx * dt * speedScale;
        star.y += star.vy * dt * speedScale;

        if (star.x < -star.radius) star.x = width + star.radius;
        else if (star.x > width + star.radius) star.x = -star.radius;

        if (star.y < -star.radius) star.y = height + star.radius;
        else if (star.y > height + star.radius) star.y = -star.radius;
    }

    function rgba(color, alpha) {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
    }

    function drawStar(star, time) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.phase);
        const twinkle = reducedMotion ? 0.84 + pulse * 0.16 : 0.58 + pulse * 0.42;
        const alpha = star.opacity * twinkle;

        if (star.glow) {
            const glow = context.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, star.radius * 6
            );
            glow.addColorStop(0, rgba(star.color, alpha * 0.28));
            glow.addColorStop(1, rgba(star.color, 0));
            context.fillStyle = glow;
            context.beginPath();
            context.arc(star.x, star.y, star.radius * 6, 0, Math.PI * 2);
            context.fill();
        }

        context.globalAlpha = alpha;
        context.fillStyle = rgba(star.color, 1);
        context.beginPath();
        context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        context.fill();
        context.globalAlpha = 1;
    }

    function draw(time) {
        context.clearRect(0, 0, width, height);
        stars.forEach(function (star) {
            drawStar(star, time);
        });
    }

    function shouldRun() {
        return isInView &&
            isPageVisible &&
            !app.classList.contains("is-home") &&
            width > 0 &&
            height > 0;
    }

    function animate(now) {
        frameId = null;
        if (!shouldRun()) return;

        const frameInterval = reducedMotion ? 1000 / 20 : 1000 / 30;
        if (lastDrawTime && now - lastDrawTime < frameInterval) {
            frameId = requestAnimationFrame(animate);
            return;
        }

        const dt = lastFrameTime
            ? Math.min(0.05, (now - lastFrameTime) / 1000)
            : 0;
        lastFrameTime = now;
        lastDrawTime = now;

        stars.forEach(function (star) {
            moveStar(star, dt);
        });
        draw(now);
        frameId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!shouldRun() || frameId !== null) return;
        frameId = requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (frameId !== null) cancelAnimationFrame(frameId);
        frameId = null;
        lastFrameTime = 0;
        lastDrawTime = 0;
    }

    function updateVisibility() {
        if (shouldRun()) startAnimation();
        else stopAnimation();
    }

    resize();

    if (typeof ResizeObserver === "function") {
        new ResizeObserver(resize).observe(content);
    } else {
        window.addEventListener("resize", resize);
    }

    if (typeof IntersectionObserver === "function") {
        new IntersectionObserver(function (entries) {
            isInView = entries.some(function (entry) {
                return entry.isIntersecting;
            });
            updateVisibility();
        }).observe(sky);
    } else {
        isInView = true;
        updateVisibility();
    }

    new MutationObserver(updateVisibility).observe(app, {
        attributes: true,
        attributeFilter: ["class"]
    });

    document.addEventListener("visibilitychange", function () {
        isPageVisible = !document.hidden;
        updateVisibility();
    });

    function onMotionPreferenceChange(event) {
        reducedMotion = event.matches;
        updateVisibility();
    }

    if (typeof motionPreference.addEventListener === "function") {
        motionPreference.addEventListener("change", onMotionPreferenceChange);
    } else if (typeof motionPreference.addListener === "function") {
        motionPreference.addListener(onMotionPreferenceChange);
    }
})();
