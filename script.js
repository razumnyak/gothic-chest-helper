const TARGET = 4;
const MIN = 1;
const MAX = 7;
const MIN_PLATES = 3;
const MAX_PLATES = 8;

const MODE_SETUP = "setup";
const MODE_EFFECTS = "effects";
const MODE_PREVIEW = "preview";
const VISUAL_REFERENCE_INITIAL = "initial";
const VISUAL_REFERENCE_BASE = "base";
const TEMPLATE_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const i18n = window.i18n;
const t = (key, vars) => i18n.t(key, vars);
const PRESET_TEMPLATE_LINES = window.PRESET_TEMPLATE_LINES ?? "";
const PLATE_MOVE_OFFSETS = {
    "-3": [-49, -25],
    "-2": [-33, -17],
    "-1": [-17, -9],
    0: [0, 0],
    1: [16, 8],
    2: [32, 16],
    3: [47, 23],
};

let mode = MODE_SETUP;
let visualReferenceMode = VISUAL_REFERENCE_INITIAL;
let plateCount = 5;
let activePlate = 0;

let initialPositions = [4, 4, 4, 4, 4];
let shiftPositions = [...initialPositions];
let demoPositions = [...initialPositions];

let effectsRight = createIdentityEffects(plateCount);

const setupModeBtn = document.getElementById("setupModeBtn");
const effectModeBtn = document.getElementById("effectModeBtn");
const previewModeBtn = document.getElementById("previewModeBtn");
const templateSelect = document.getElementById("templateSelect");
const templateCode = document.getElementById("templateCode");
const importTemplateBtn =
    document.getElementById("importTemplateBtn");
const copyTemplateBtn = document.getElementById("copyTemplateBtn");
const templateActionsEl =
    importTemplateBtn.closest(".template-actions");

const setupPanel = document.getElementById("setupPanel");
const effectPanel = document.getElementById("effectPanel");
const previewPanel = document.getElementById("previewPanel");

const plateMinus = document.getElementById("plateMinus");
const platePlus = document.getElementById("platePlus");
const plateCountView = document.getElementById("plateCountView");

const positionsEl = document.getElementById("positions");
const activePlateListEl =
    document.getElementById("activePlateList");
const effectListEl = document.getElementById("effectList");
const presetSuggestionsEl =
    document.getElementById("presetSuggestions");
const centerPresetSuggestionsEl = document.getElementById(
    "centerPresetSuggestions",
);
const visualReferenceSelect = document.getElementById(
    "visualReferenceSelect",
);

const plateStackEl = document.getElementById("plateStack");

const beforeStateEl = document.getElementById("beforeState");
const afterStateEl = document.getElementById("afterState");
const previewStateEl = beforeStateEl.closest(".preview-state");
const wasdOutputEl = document.getElementById("wasdOutput");
const wasdPanelEl = wasdOutputEl.closest(".wasd-panel");
const initialInfoPanel = document.getElementById("initialInfoPanel");
const initialLanguageSwitcher = document.getElementById(
    "initialLanguageSwitcher",
);

const algorithmSelect = document.getElementById("algorithmSelect");
const solveBtn = document.getElementById("solveBtn");
const bestBtn = document.getElementById("bestBtn");
const bestProgressEl = document.getElementById("bestProgress");
const bestProgressFillEl =
    document.getElementById("bestProgressFill");
const bestProgressLabelEl =
    document.getElementById("bestProgressLabel");
const resetBtn = document.getElementById("resetBtn");
const resetConfirmModal =
    document.getElementById("resetConfirmModal");
const cancelResetBtn = document.getElementById("cancelResetBtn");
const confirmResetBtn = document.getElementById("confirmResetBtn");
const languageSelect = document.getElementById("languageSelect");

const statusTextEl = document.getElementById("statusText");
const comboTextEl = document.getElementById("comboText");
const algorithmFaqEl = document.getElementById("algorithmFaq");
const stepsEl = document.getElementById("steps");
const solutionStartBtn = document.getElementById("solutionStartBtn");
const solutionPrevBtn = document.getElementById("solutionPrevBtn");
const solutionPlayBtn = document.getElementById("solutionPlayBtn");
const solutionNextBtn = document.getElementById("solutionNextBtn");
const playbackSpeedScale = document.getElementById("playbackSpeedScale");
const plateHitCanvas = document.createElement("canvas");
const plateHitContext = plateHitCanvas.getContext("2d", {
    willReadFrequently: true,
});

let plateHitImage = null;
let plateHitImageReady = false;
let plateHitCanvasReadable = false;
let solutionSteps = [];
let solutionTimeline = [];
let activeSolutionStage = 0;
let solutionPlayTimer = null;
let isSolutionPlaying = false;
let playbackSpeed = 1;
let solverWorker = null;
let activeSolveRequestId = 0;
let isSolving = false;
let hasManualTemplateCode = false;
let shareTooltipTimer = null;

let solutionCache = {};
let cachedSetupKey = null;

i18n.init();

function getSetupKey() {
    return JSON.stringify({
        plateCount,
        initialPositions: initialPositions.slice(),
        effectsRight: effectsRight.map((row) => row.slice()),
    });
}

function invalidateSolutionCache() {
    solutionCache = {};
    cachedSetupKey = null;
}

function getCachedSolution(algorithm) {
    const key = getSetupKey();
    if (key !== cachedSetupKey) {
        solutionCache = {};
        cachedSetupKey = key;
    }
    return solutionCache[algorithm];
}

function setCachedSolution(algorithm, solution) {
    const key = getSetupKey();
    if (key !== cachedSetupKey) {
        solutionCache = {};
        cachedSetupKey = key;
    }
    solutionCache[algorithm] = solution;
}

function setBestProgress(done, total, label) {
    const percent =
        total > 0 ? Math.round((done / total) * 100) : 0;
    if (bestProgressEl) {
        bestProgressEl.hidden = false;
    }
    if (bestProgressFillEl) {
        bestProgressFillEl.style.setProperty(
            "--best-progress",
            `${percent}%`,
        );
    }
                if (bestProgressLabelEl) {
                    bestProgressLabelEl.textContent = `${done}/${total} ${label}`;
    }
}

function hideBestProgress() {
    if (bestProgressEl) {
        bestProgressEl.hidden = true;
    }
    if (bestProgressFillEl) {
        bestProgressFillEl.style.setProperty(
            "--best-progress",
            "0%",
        );
    }
    if (bestProgressLabelEl) {
        bestProgressLabelEl.textContent = "";
    }
}

function isSetupLocked() {
    return isSolving;
}

function updateSetupLock() {
    const locked = isSetupLocked();

    templateSelect.disabled = locked;
    templateCode.disabled = locked;
    importTemplateBtn.disabled = locked;
    resetBtn.disabled = locked;
    plateMinus.disabled = locked;
    platePlus.disabled = locked;
    algorithmSelect.disabled = locked;

    setupModeBtn.disabled = locked && mode !== MODE_SETUP;
    effectModeBtn.disabled = locked && mode !== MODE_EFFECTS;
}

const presetTemplates = parsePresetTemplates(PRESET_TEMPLATE_LINES);

function cssNumber(name) {
    return Number.parseFloat(
        getComputedStyle(document.documentElement)
            .getPropertyValue(name)
            .trim(),
    );
}

function getPlateMoveOffset(position) {
    const delta = clamp(
        position - TARGET,
        MIN - TARGET,
        MAX - TARGET,
    );
    return PLATE_MOVE_OFFSETS[delta] ?? [0, 0];
}

function loadPlateHitImage() {
    plateHitImage = new Image();
    plateHitImage.src = "src/plate.png";

    plateHitImage.onload = () => {
        document.documentElement.style.setProperty(
            "--plate-aspect",
            `${plateHitImage.naturalWidth} / ${plateHitImage.naturalHeight}`,
        );
        plateHitCanvas.width = plateHitImage.naturalWidth;
        plateHitCanvas.height = plateHitImage.naturalHeight;
        plateHitContext.clearRect(
            0,
            0,
            plateHitCanvas.width,
            plateHitCanvas.height,
        );
        plateHitContext.drawImage(plateHitImage, 0, 0);
        try {
            plateHitContext.getImageData(0, 0, 1, 1);
            plateHitCanvasReadable = true;
        } catch (error) {
            plateHitCanvasReadable = false;
        }
        plateHitImageReady = true;
    };
}
setupModeBtn.addEventListener("click", () => setMode(MODE_SETUP));
effectModeBtn.addEventListener("click", () =>
    setMode(MODE_EFFECTS),
);
previewModeBtn.addEventListener("click", () =>
    setMode(MODE_PREVIEW),
);

plateMinus.addEventListener("click", () =>
    setPlateCount(plateCount - 1),
);
platePlus.addEventListener("click", () =>
    setPlateCount(plateCount + 1),
);

solveBtn.addEventListener("click", solve);
if (bestBtn) bestBtn.addEventListener("click", findBestSolution);
if (languageSelect) {
    languageSelect.addEventListener("change", () => {
        i18n.setLanguage(languageSelect.value);
    });
}
if (initialLanguageSwitcher) {
    initialLanguageSwitcher.addEventListener("click", (event) => {
        const button = event.target.closest("[data-lang]");
        if (!button) {
            return;
        }

        i18n.setLanguage(button.dataset.lang);
    });
}
if (visualReferenceSelect) {
    visualReferenceSelect.addEventListener("change", () => {
        visualReferenceMode = visualReferenceSelect.value;
        render();
    });
}
algorithmSelect.addEventListener("change", () => {
    if (isSolving) {
        return;
    }

    applyCachedAlgorithmSolution();
});
resetBtn.addEventListener("click", openResetConfirmModal);
cancelResetBtn.addEventListener("click", closeResetConfirmModal);
confirmResetBtn.addEventListener("click", () => {
    closeResetConfirmModal();
    reset();
});
resetConfirmModal.addEventListener("click", (event) => {
    if (event.target === resetConfirmModal) {
        closeResetConfirmModal();
    }
});
window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !resetConfirmModal.hidden) {
        closeResetConfirmModal();
    }
});
solutionStartBtn.addEventListener("click", () => {
    stopSolutionPlayback();
    setActiveSolutionStage(0, { scroll: true });
});
solutionPrevBtn.addEventListener("click", () => {
    stopSolutionPlayback();
    setActiveSolutionStage(activeSolutionStage - 1);
});
solutionPlayBtn.addEventListener("click", toggleSolutionPlayback);
solutionNextBtn.addEventListener("click", () => {
    stopSolutionPlayback();
    setActiveSolutionStage(activeSolutionStage + 1);
});
wasdOutputEl.addEventListener("click", (event) => {
    const group = event.target.closest(".wasd-group");
    if (!group) {
        return;
    }

    const moveIndex = Number(group.dataset.moveIndex);
    if (!Number.isFinite(moveIndex)) {
        return;
    }

    stopSolutionPlayback();
    setActiveSolutionStage(moveIndex + 1, { scroll: true });
});
if (playbackSpeedScale) {
    playbackSpeedScale.addEventListener("click", (event) => {
        const option = event.target.closest(".speed-option");
        if (!option) {
            return;
        }

        playbackSpeed = Number(option.dataset.speed) || 1;
        playbackSpeedScale
            .querySelectorAll(".speed-option")
            .forEach((button) => {
                button.classList.toggle("active", button === option);
            });

        if (isSolutionPlaying) {
            stopSolutionPlayback();
            startSolutionPlayback();
        }
    });
}
templateSelect.addEventListener("change", applySelectedTemplate);
templateCode.addEventListener("input", () => {
    hasManualTemplateCode = true;
    templateSelect.value = "";
    updateLocationCode(null);
    syncTemplateReadonly();
});
importTemplateBtn.addEventListener("click", importTemplateCode);
copyTemplateBtn.addEventListener("click", copyTemplateCode);

window.addEventListener("languagechange", () => {
    render();
    if (solutionTimeline.length > 0) {
        const stage = activeSolutionStage;
        renderSolvedPath([...initialPositions], solutionSteps);
        setActiveSolutionStage(stage);
    } else {
        clearSolution();
    }
});

window.addEventListener("contextmenu", (event) => {
    if (event.target.closest("#plateStack")) {
        event.preventDefault();
    }
});
plateStackEl.addEventListener(
    "mousedown",
    handlePlateStackMouseDown,
);

plateStackEl.addEventListener("auxclick", (event) => {
    event.preventDefault();
});

function createIdentityEffects(count) {
    return Array.from({ length: count }, (_, row) => {
        return Array.from({ length: count }, (_, col) =>
            row === col ? 1 : 0,
        );
    });
}

function parsePresetTemplates(lines) {
    return lines
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [name, code] = line.split("|");
            const cleanCode = code.trim();
            const template = decodeTemplate(cleanCode);

            return {
                name: name.trim(),
                code: cleanCode,
                plateCount: template.plateCount,
                positions: [...template.positions],
                effectsRight: template.effectsRight.map((row) => [
                    ...row,
                ]),
                initialKey: getInitialLayoutKey(
                    template.plateCount,
                    template.positions,
                ),
            };
        });
}

function getInitialLayoutKey(count, positions) {
    return `${count}:${positions.join(",")}`;
}

function getCurrentInitialLayoutKey() {
    return getInitialLayoutKey(plateCount, initialPositions);
}

function renderTemplateSelect() {
    templateSelect.innerHTML = "";

    const custom = document.createElement("option");
    custom.value = "";
    custom.textContent = t("custom");
    templateSelect.appendChild(custom);

    presetTemplates.forEach((preset) => {
        const option = document.createElement("option");
        option.value = preset.code;
        option.textContent = preset.name;
        templateSelect.appendChild(option);
    });

    templateSelect.value = "";
}

function encodeTemplate() {
    let code = encodeValue(plateCount, 1);

    initialPositions.forEach((position) => {
        code += encodeValue(position, MIN);
    });

    effectsRight.forEach((row) => {
        row.forEach((value) => {
            code += encodeValue(value, -1);
        });
    });

    return code;
}

function decodeTemplate(code) {
    const cleanCode = code.trim();
    let cursor = 0;

    const nextValue = (offset) => {
        if (cursor >= cleanCode.length) {
            throw new Error(t("template_too_short"));
        }

        return decodeValue(cleanCode[cursor++], offset);
    };

    const nextPlateCount = nextValue(1);

    if (
        nextPlateCount < MIN_PLATES ||
        nextPlateCount > MAX_PLATES
    ) {
        throw new Error(t("invalid_plate_count"));
    }

    const nextPositions = Array.from(
        { length: nextPlateCount },
        () => nextValue(MIN),
    );

    if (
        nextPositions.some(
            (position) => position < MIN || position > MAX,
        )
    ) {
        throw new Error(t("invalid_initial_layout"));
    }

    const nextEffects = Array.from({ length: nextPlateCount }, () =>
        Array.from({ length: nextPlateCount }, () => nextValue(-1)),
    );

    if (
        nextEffects.some((row) =>
            row.some((value) => value < -1 || value > 1),
        )
    ) {
        throw new Error(t("invalid_shift_effects"));
    }

    if (cursor !== cleanCode.length) {
        throw new Error(t("template_extra_characters"));
    }

    return {
        plateCount: nextPlateCount,
        positions: nextPositions,
        effectsRight: nextEffects,
    };
}

function encodeValue(value, offset) {
    return TEMPLATE_ALPHABET[value - offset];
}

function decodeValue(char, offset) {
    const index = TEMPLATE_ALPHABET.indexOf(char);

    if (index < 0) {
        throw new Error(t("invalid_template_character", { char }));
    }

    return index + offset;
}

function syncTemplateCode() {
    hasManualTemplateCode = false;
    templateCode.value = encodeTemplate();
    updateTemplateActions();
}

function syncTemplateReadonly() {
    templateCode.readOnly = templateSelect.value !== "";
    updateTemplateActions();
}

function updateTemplateActions() {
    const usingPreset = templateSelect.value !== "";
    const showApply = !usingPreset && hasManualTemplateCode;

    importTemplateBtn.hidden = !showApply;
    copyTemplateBtn.textContent = usingPreset ? t("share") : t("copy");
    templateActionsEl.classList.toggle("single", !showApply);
}

function applyTemplate(template) {
    if (isSetupLocked()) {
        return;
    }

    plateCount = template.plateCount;
    initialPositions = [...template.positions];
    shiftPositions = [...initialPositions];
    demoPositions = [...initialPositions];
    effectsRight = template.effectsRight.map((row) => [...row]);
    activePlate = Math.min(activePlate, plateCount - 1);
    normalizeActivePlateEffect();

    invalidateSolutionCache();
    clearSolution();
    render();
    syncTemplateCode();
}

function applyPresetShiftEffects(preset) {
    if (isSetupLocked()) {
        return;
    }

    templateSelect.value = "";
    syncTemplateReadonly();
    effectsRight = preset.effectsRight.map((row) => [...row]);
    shiftPositions = [...initialPositions];
    demoPositions = [...initialPositions];

    clearSolution({ resetStatus: false });
    render();

    statusTextEl.textContent = t("shift_applied", { name: preset.name });
    statusTextEl.classList.remove("error");
    comboTextEl.textContent = t("calculate_to_solve");
}

function applySelectedTemplate() {
    if (isSetupLocked()) {
        return;
    }

    if (!templateSelect.value) {
        updateLocationCode(null);
        hasManualTemplateCode = false;
        syncTemplateReadonly();
        syncTemplateCode();
        return;
    }

    try {
        const code = templateSelect.value;
        applyTemplate(decodeTemplate(templateSelect.value));
        templateCode.value = code;
        syncTemplateReadonly();
        updateLocationCode(code);
    } catch (error) {
        statusTextEl.textContent = error.message;
        statusTextEl.classList.add("error");
    }
}

function selectMatchingTemplate(code) {
    const cleanCode = code.trim();
    const matchingPreset = presetTemplates.find((preset) => {
        return preset.code === cleanCode;
    });

    templateSelect.value = matchingPreset
        ? matchingPreset.code
        : "";
    hasManualTemplateCode = false;
    syncTemplateReadonly();

    return matchingPreset;
}

function importTemplateCode() {
    if (isSetupLocked()) {
        return;
    }

    try {
        const code = templateCode.value.trim();
        selectMatchingTemplate(code);
        applyTemplate(decodeTemplate(code));
        templateCode.value = code;
    } catch (error) {
        statusTextEl.textContent = error.message;
        statusTextEl.classList.add("error");
    }
}

function applyQueryCode() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code === null) {
        return false;
    }

    try {
        const cleanCode = code.trim();
        selectMatchingTemplate(cleanCode);
        templateCode.value = cleanCode;
        applyTemplate(decodeTemplate(cleanCode));
        return true;
    } catch (error) {
        statusTextEl.textContent = error.message;
        statusTextEl.classList.add("error");
        return false;
    }
}

function hasPreviewQuery() {
    const params = new URLSearchParams(window.location.search);
    const value = params.get("preview");

    return params.has("preview") && (value === "" || value === "1");
}

async function copyTemplateCode() {
    if (!hasManualTemplateCode) {
        syncTemplateCode();
    }

    const isShare = templateSelect.value !== "";
    const text = isShare
        ? createShareUrl(templateCode.value)
        : templateCode.value;
    templateCode.select();

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        copyTextFallback(text);
    }

    if (isShare) {
        showShareCopiedTooltip();
    }
}

function copyTextFallback(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
}

function showShareCopiedTooltip() {
    copyTemplateBtn.classList.add("copied");

    if (shareTooltipTimer !== null) {
        window.clearTimeout(shareTooltipTimer);
    }

    shareTooltipTimer = window.setTimeout(() => {
        copyTemplateBtn.classList.remove("copied");
        shareTooltipTimer = null;
    }, 1200);
}

function createShareUrl(code) {
    const url = new URL("index.html", window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("code", code.trim());
    url.searchParams.set("lang", i18n.getLanguage());
    url.searchParams.set("preview", "1");

    return url.toString();
}

function updateLocationCode(code) {
    const url =
        code === null
            ? new URL(window.location.href)
            : new URL("index.html", window.location.href);

    if (code === null) {
        url.searchParams.delete("code");
    } else {
        url.search = "";
        url.hash = "";
        url.searchParams.set("code", code.trim());
        url.searchParams.set("lang", i18n.getLanguage());
        if (mode === MODE_PREVIEW) {
            url.searchParams.set("preview", "1");
        }
    }

    const nextUrl = url.toString();

    if (nextUrl !== window.location.href) {
        window.history.pushState(null, "", nextUrl);
    }
}

function handlePlateStackMouseDown(event) {
    event.preventDefault();

    if (isSetupLocked()) {
        return;
    }

    if (!plateHitImageReady) {
        return;
    }

    const hit = findTopPlateUnderPointer(
        event.clientX,
        event.clientY,
    );

    if (!hit) {
        return;
    }

    handlePlateMouseDown(event, hit.plateIndex);
}

function findTopPlateUnderPointer(clientX, clientY) {
    const plates = [...plateStackEl.querySelectorAll(".plate")];

    plates.sort((a, b) => {
        return Number(b.style.zIndex) - Number(a.style.zIndex);
    });

    for (const plate of plates) {
        const rect = plate.getBoundingClientRect();

        const insideRect =
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom;

        if (!insideRect) {
            continue;
        }

        const localX = clientX - rect.left;
        const localY = clientY - rect.top;

        const alpha = getPlateAlphaAt(
            localX,
            localY,
            rect.width,
            rect.height,
        );

        if (alpha > 20) {
            return {
                plateIndex: Number(plate.dataset.index),
                alpha,
            };
        }
    }

    return null;
}

function getPlateAlphaAt(
    localX,
    localY,
    renderedWidth,
    renderedHeight,
) {
    const imageWidth = plateHitImage.naturalWidth;
    const imageHeight = plateHitImage.naturalHeight;

    const imageRatio = imageWidth / imageHeight;
    const renderedRatio = renderedWidth / renderedHeight;

    let drawWidth;
    let drawHeight;
    let offsetX = 0;
    let offsetY = 0;

    if (renderedRatio > imageRatio) {
        drawHeight = renderedHeight;
        drawWidth = drawHeight * imageRatio;
        offsetX = (renderedWidth - drawWidth) / 2;
    } else {
        drawWidth = renderedWidth;
        drawHeight = drawWidth / imageRatio;
        offsetY = (renderedHeight - drawHeight) / 2;
    }

    const imageX = ((localX - offsetX) / drawWidth) * imageWidth;
    const imageY = ((localY - offsetY) / drawHeight) * imageHeight;

    if (
        imageX < 0 ||
        imageY < 0 ||
        imageX >= imageWidth ||
        imageY >= imageHeight
    ) {
        return 0;
    }

    if (!plateHitCanvasReadable) {
        return 255;
    }

    const pixel = plateHitContext.getImageData(
        Math.floor(imageX),
        Math.floor(imageY),
        1,
        1,
    ).data;

    return pixel[3];
}
function setMode(nextMode) {
    if (mode === MODE_PREVIEW && nextMode !== MODE_PREVIEW) {
        stopSolutionPlayback();
    }

    mode = nextMode;

    setupModeBtn.classList.toggle("active", mode === MODE_SETUP);
    effectModeBtn.classList.toggle("active", mode === MODE_EFFECTS);
    previewModeBtn.classList.toggle(
        "active",
        mode === MODE_PREVIEW,
    );

    setupPanel.hidden = mode !== MODE_SETUP;
    effectPanel.hidden = mode !== MODE_EFFECTS;
    previewPanel.hidden = mode !== MODE_PREVIEW;

    render();
}

function setPlateCount(nextCount) {
    if (isSetupLocked()) {
        return;
    }

    templateSelect.value = "";
    syncTemplateReadonly();
    plateCount = clamp(nextCount, MIN_PLATES, MAX_PLATES);

    initialPositions = Array.from(
        { length: plateCount },
        (_, index) => {
            return initialPositions[index] ?? TARGET;
        },
    );
    shiftPositions = Array.from(
        { length: plateCount },
        (_, index) => {
            return shiftPositions[index] ?? initialPositions[index];
        },
    );
    demoPositions = Array.from(
        { length: plateCount },
        (_, index) => {
            return demoPositions[index] ?? initialPositions[index];
        },
    );

    const oldEffects = effectsRight;

    effectsRight = Array.from({ length: plateCount }, (_, row) => {
        return Array.from({ length: plateCount }, (_, col) => {
            return oldEffects[row]?.[col] ?? (row === col ? 1 : 0);
        });
    });

    if (activePlate >= plateCount) {
        activePlate = plateCount - 1;
    }

    normalizeActivePlateEffect();
    invalidateSolutionCache();
    clearSolution();
    render();
}

function render() {
    plateCountView.textContent = String(plateCount);
    if (visualReferenceSelect) {
        visualReferenceSelect.value = visualReferenceMode;
    }

    renderSetupPositions();
    renderActivePlateSelector();
    renderEffectList();
    renderPresetSuggestions();
    renderPlateStack();
    const displayPositions = getDisplayPositions();
    if (mode === MODE_EFFECTS) {
        const before = getShiftVisualPositions();
        const after = applyMove(before, activePlate, +1) ?? before;
        renderStatePreview(before, after);
    } else if (mode === MODE_PREVIEW && solutionTimeline.length > 0) {
        const stage = solutionTimeline[activeSolutionStage];
        renderStatePreview(stage.before, demoPositions);
    } else {
        renderStatePreview(displayPositions, displayPositions);
    }
    syncTemplateCode();
    updateSetupLock();
    updatePreviewOnlyVisibility();
}

function updatePreviewOnlyVisibility() {
    const previewOnly = mode === MODE_PREVIEW;
    const hasResult = solutionTimeline.length > 0;
    if (initialInfoPanel) {
        initialInfoPanel.hidden = mode !== MODE_SETUP;
    }
    if (initialLanguageSwitcher) {
        const showInitialLanguages =
            mode === MODE_SETUP && templateSelect.value === "";
        initialLanguageSwitcher.hidden = !showInitialLanguages;
        initialLanguageSwitcher
            .querySelectorAll("[data-lang]")
            .forEach((button) => {
                button.classList.toggle(
                    "active",
                    button.dataset.lang === i18n.getLanguage(),
                );
            });
    }
    if (previewStateEl) {
        previewStateEl.hidden = mode === MODE_SETUP;
    }
    if (wasdPanelEl) {
        wasdPanelEl.hidden = !previewOnly;
    }
    if (algorithmFaqEl) {
        algorithmFaqEl.hidden = hasResult;
    }
    stepsEl.hidden = !previewOnly;
}

function renderSetupPositions() {
    positionsEl.innerHTML = "";

    initialPositions.forEach((position, index) => {
        const row = document.createElement("div");
        row.className = "position-row";

        const name = document.createElement("div");
        name.className = "plate-name";
        name.textContent = `P${index + 1}`;

        const leftBtn = document.createElement("button");
        leftBtn.className = "basic-btn";
        leftBtn.disabled = isSetupLocked();
        leftBtn.textContent = "←";
        leftBtn.addEventListener("click", () =>
            changeInitialPosition(index, -1),
        );

        const scale = createScale(position);

        const rightBtn = document.createElement("button");
        rightBtn.className = "basic-btn";
        rightBtn.disabled = isSetupLocked();
        rightBtn.textContent = "→";
        rightBtn.addEventListener("click", () =>
            changeInitialPosition(index, +1),
        );

        row.appendChild(name);
        row.appendChild(leftBtn);
        row.appendChild(scale);
        row.appendChild(rightBtn);

        positionsEl.appendChild(row);
    });
}

function createScale(position) {
    const scale = document.createElement("div");
    scale.className = "scale";

    for (let value = MIN; value <= MAX; value++) {
        const item = document.createElement("span");
        item.textContent = String(value);

        if (value === position) {
            item.className = "active";
        }

        scale.appendChild(item);
    }

    return scale;
}

function renderActivePlateSelector() {
    activePlateListEl.innerHTML = "";
    activePlateListEl.classList.toggle("wide", plateCount >= 7);

    for (let index = 0; index < plateCount; index++) {
        const row = document.createElement("button");
        row.className =
            index === activePlate
                ? "basic-btn active-row"
                : "basic-btn";
        row.disabled = isSetupLocked();
        row.textContent = `P${index + 1}`;
        row.addEventListener("click", () => {
            activePlate = index;
            normalizeActivePlateEffect();
            render();
        });

        activePlateListEl.appendChild(row);
    }
}

function getMatchingShiftPresets() {
    const currentKey = getCurrentInitialLayoutKey();

    return presetTemplates.filter((preset) => {
        return preset.initialKey === currentKey;
    });
}

function renderPresetSuggestions() {
    presetSuggestionsEl.innerHTML = "";
    presetSuggestionsEl.hidden = true;

    if (!centerPresetSuggestionsEl) {
        return;
    }

    centerPresetSuggestionsEl.innerHTML = "";

    if (mode !== MODE_SETUP || templateSelect.value !== "") {
        centerPresetSuggestionsEl.hidden = true;
        return;
    }

    const matches = getMatchingShiftPresets();

    if (matches.length === 0) {
        centerPresetSuggestionsEl.hidden = true;
        return;
    }

    centerPresetSuggestionsEl.hidden = false;

    const title = document.createElement("div");
    title.className = "preset-suggestions-title";
    title.textContent = t("suggested_shift_effects");
    centerPresetSuggestionsEl.appendChild(title);

    matches.forEach((preset) => {
        const row = document.createElement("div");
        row.className = "preset-suggestion";

        const name = document.createElement("div");
        name.className = "preset-suggestion-name";
        name.textContent = preset.name;

        const applyBtn = document.createElement("button");
        applyBtn.type = "button";
        applyBtn.className = "basic-btn";
        applyBtn.disabled = isSetupLocked();
        applyBtn.textContent = t("apply");
        applyBtn.addEventListener("click", () => {
            applyPresetShiftEffects(preset);
        });

        row.appendChild(name);
        row.appendChild(applyBtn);
        centerPresetSuggestionsEl.appendChild(row);
    });
}

function renderEffectList() {
    effectListEl.innerHTML = "";

    for (let index = 0; index < plateCount; index++) {
        const value = effectsRight[activePlate][index];
        const locked = index === activePlate;

        const row = document.createElement("div");
        row.className = "effect-row";

        const name = document.createElement("div");
        name.className = "plate-name";
        name.textContent = `P${index + 1}`;

        const description = document.createElement("div");
        description.textContent = locked
            ? t("active_plate")
            : getEffectDescription(value);

        const valueBox = document.createElement("div");
        valueBox.className = `effect-value ${getEffectClass(value)}${
            locked ? " locked" : ""
        }`;

        const valueNumber = document.createElement("div");
        valueNumber.className = "effect-number";
        valueNumber.textContent = formatEffect(value);

        const valueLabel = document.createElement("div");
        valueLabel.className = "effect-label";
        valueLabel.textContent = getEffectLabel(value);

        valueBox.appendChild(valueNumber);
        valueBox.appendChild(valueLabel);
        valueBox.title = locked
            ? t("active_plate_always")
            : t("click_cycle_effect");
        valueBox.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        valueBox.addEventListener("auxclick", (event) => {
            event.preventDefault();
        });
        valueBox.addEventListener("mousedown", (event) => {
            event.preventDefault();

            if (locked || isSetupLocked()) {
                return;
            }

            if (event.button === 0) {
                cycleEffect(index);
            }
        });

        row.appendChild(name);
        row.appendChild(description);
        row.appendChild(valueBox);

        effectListEl.appendChild(row);
    }
}

function renderPlateStack() {
    const displayPositions = getVisualDisplayPositions();
    const previewStep =
        mode === MODE_PREVIEW
            ? solutionTimeline[activeSolutionStage]?.step
            : null;
    const existingPlates = new Map(
        [...plateStackEl.querySelectorAll(".plate")].map(
            (plate) => [Number(plate.dataset.index), plate],
        ),
    );

    existingPlates.forEach((plate, index) => {
        if (index >= plateCount) {
            plate.remove();
        }
    });

    for (let index = 0; index < plateCount; index++) {
        let plate = existingPlates.get(index);
        let shouldAppendPlate = false;

        if (!plate) {
            plate = document.createElement("div");
            plate.dataset.index = String(index);
            shouldAppendPlate = true;

            const label = document.createElement("div");
            label.className = "plate-label";
            plate.appendChild(label);

            const position = document.createElement("div");
            position.className = "plate-position";
            plate.appendChild(position);

            const targetDot = document.createElement("div");
            targetDot.className = "plate-target-dot";
            plate.appendChild(targetDot);

            const effectBadge = document.createElement("div");
            effectBadge.className = "plate-effect-badge";
            plate.appendChild(effectBadge);
        }

        plate.className = "plate";
        plate.dataset.index = String(index);

        const stackStepX = cssNumber("--plate-step-x");
        const stackStepY = cssNumber("--plate-step-y");
        const stackX = index * stackStepX;
        const stackY = index * stackStepY;

        const [moveX, moveY] = getPlateMoveOffset(
            displayPositions[index],
        );

        plate.style.left = `${
            stackX - ((plateCount - 1) * stackStepX) / 2
        }px`;
        plate.style.bottom = `${stackY}px`;
        plate.style.transform = `translate(${moveX}px, ${moveY}px)`;
        plate.style.setProperty(
            "--brightness",
            String(1 - index * 0.035),
        );
        plate.style.zIndex = String(plateCount - index);

        if (mode === MODE_EFFECTS && index === activePlate) {
            plate.classList.add("active");
        }

        if (mode === MODE_EFFECTS && index !== activePlate) {
            const effect = effectsRight[activePlate][index];

            if (effect < 0) {
                plate.classList.add("effect-negative");
            }

            if (effect > 0) {
                plate.classList.add("effect-positive");
            }
        }

        if (mode === MODE_PREVIEW && previewStep) {
            if (index === previewStep.plateIndex) {
                plate.classList.add("active");
            } else {
                const delta =
                    previewStep.after[index] -
                    previewStep.before[index];

                if (delta < 0) {
                    plate.classList.add("effect-negative");
                }

                if (delta > 0) {
                    plate.classList.add("effect-positive");
                }
            }
        }

        const label = plate.querySelector(".plate-label");
        label.textContent = `P${index + 1}`;

        const position = plate.querySelector(".plate-position");
        position.textContent = String(displayPositions[index]);

        const targetDot = plate.querySelector(".plate-target-dot");
        targetDot.className =
            displayPositions[index] === TARGET
                ? "plate-target-dot target"
                : "plate-target-dot offset";
        targetDot.style.setProperty(
            "--target-dot-offset-x",
            `${-moveX}px`,
        );
        targetDot.style.setProperty(
            "--target-dot-offset-y",
            `${-moveY}px`,
        );

        const effectBadge = plate.querySelector(
            ".plate-effect-badge",
        );
        const effect = effectsRight[activePlate][index];
        effectBadge.className = `plate-effect-badge ${getEffectClass(effect)}`;

        if (mode === MODE_EFFECTS) {
            effectBadge.classList.add("visible");
            effectBadge.textContent = formatEffect(effect);
        } else {
            effectBadge.textContent = "";
        }

        if (shouldAppendPlate) {
            plateStackEl.appendChild(plate);
        }
    }
}

function handlePlateMouseDown(event, plateIndex) {
    event.preventDefault();

    if (isSetupLocked()) {
        return;
    }

    if (mode === MODE_SETUP) {
        if (event.button === 0) {
            changeInitialPosition(plateIndex, -1);
            return;
        }

        if (event.button === 2) {
            changeInitialPosition(plateIndex, +1);
            return;
        }

        return;
    }

    if (mode === MODE_EFFECTS) {
        if (plateIndex === activePlate) {
            return;
        }

        if (event.button === 0) {
            cycleEffect(plateIndex);
        }
    }
}

function changeInitialPosition(index, delta) {
    if (isSetupLocked()) {
        return;
    }

    templateSelect.value = "";
    syncTemplateReadonly();
    initialPositions[index] = clamp(
        initialPositions[index] + delta,
        MIN,
        MAX,
    );
    shiftPositions = [...initialPositions];
    demoPositions = [...initialPositions];
    invalidateSolutionCache();
    clearSolution();
    render();
}

function setEffect(affectedPlate, value) {
    if (isSetupLocked()) {
        return;
    }

    if (affectedPlate === activePlate) {
        return;
    }

    templateSelect.value = "";
    syncTemplateReadonly();
    effectsRight[activePlate][affectedPlate] = value;

    invalidateSolutionCache();
    clearSolution({ resetStatus: false });
    render();

    statusTextEl.textContent = t("effect_preview", {
        plate: activePlate + 1,
    });
    statusTextEl.classList.remove("error");
    comboTextEl.textContent = `P${activePlate + 1}R`;
}

function cycleEffect(affectedPlate) {
    setEffect(
        affectedPlate,
        getNextEffectValue(
            effectsRight[activePlate][affectedPlate],
        ),
    );
}

function getNextEffectValue(value) {
    if (value === 0) {
        return +1;
    }

    if (value > 0) {
        return -1;
    }

    return 0;
}

function normalizeActivePlateEffect() {
    effectsRight[activePlate][activePlate] = 1;
}

function getEffectDescription(value) {
    if (value < 0) {
        return t("effect_moves_left");
    }

    if (value > 0) {
        return t("effect_moves_right");
    }

    return t("effect_no_move");
}

function getEffectLabel(value) {
    if (value < 0) {
        return t("effect_reverse");
    }

    if (value > 0) {
        return t("effect_same");
    }

    return t("effect_none");
}

function getEffectClass(value) {
    if (value < 0) return "negative";
    if (value > 0) return "positive";
    return "zero";
}

function formatEffect(value) {
    if (value > 0) return "+1";
    return String(value);
}

function renderStatePreview(before, after) {
    beforeStateEl.innerHTML = "";
    afterStateEl.innerHTML = "";
    beforeStateEl.style.setProperty(
        "--state-count",
        String(before.length),
    );
    afterStateEl.style.setProperty(
        "--state-count",
        String(after.length),
    );

    before.forEach((value, index) => {
        const cell = document.createElement("div");
        cell.className =
            mode === MODE_EFFECTS && index === activePlate
                ? "state-cell active-plate"
                : "state-cell";
        cell.textContent = String(value);
        beforeStateEl.appendChild(cell);
    });

    after.forEach((value, index) => {
        const cell = document.createElement("div");
        const classes = ["state-cell"];
        if (before[index] !== value) {
            classes.push("changed");
        }
        if (mode === MODE_EFFECTS) {
            classes.push(`effect-${getEffectClass(effectsRight[activePlate][index])}`);
        }
        cell.className = classes.join(" ");
        cell.textContent = String(value);
        afterStateEl.appendChild(cell);
    });
}

function getDisplayPositions() {
    if (mode === MODE_SETUP) {
        return initialPositions;
    }

    if (mode === MODE_EFFECTS) {
        return shiftPositions;
    }

    return demoPositions;
}

function getShiftVisualPositions() {
    if (visualReferenceMode === VISUAL_REFERENCE_BASE) {
        return Array.from({ length: plateCount }, () => TARGET);
    }

    return shiftPositions;
}

function getVisualDisplayPositions() {
    if (mode === MODE_EFFECTS) {
        return getShiftVisualPositions();
    }

    return getDisplayPositions();
}

function applyMove(state, plateIndex, direction) {
    const next = state.map((value, index) => {
        return value + effectsRight[plateIndex][index] * direction;
    });

    const legal = next.every(
        (value) => value >= MIN && value <= MAX,
    );

    return legal ? next : null;
}

function formatMoveToken(step) {
    return `${step.plateIndex + 1}\u2009${step.direction > 0 ? "R" : "L"}`;
}

function createMoveToken(step, moveIndex = null) {
    const token = document.createElement("span");
    token.className = `move-token ${step.direction > 0 ? "right" : "left"}`;
    token.textContent = formatMoveToken(step);

    if (moveIndex !== null) {
        token.dataset.moveIndex = String(moveIndex);
    }

    return token;
}

function renderMoveTokens(container, steps) {
    container.innerHTML = "";

    if (steps.length === 0) {
        container.textContent = "—";
        return;
    }

    steps.forEach((step, index) => {
        if (index > 0) {
            const separator = document.createElement("span");
            separator.className = "move-separator";
            separator.textContent = "→";
            container.appendChild(separator);
        }

        container.appendChild(createMoveToken(step, index));
    });
}

function renderWasdTranscription(steps) {
    wasdOutputEl.innerHTML = "";

    const wasdTitleEl = document.getElementById("wasdTitle");

    if (steps.length === 0) {
        const empty = document.createElement("span");
        empty.className = "wasd-empty";
            empty.textContent = t("no_movement_required");
        wasdOutputEl.appendChild(empty);
        if (wasdTitleEl) {
            wasdTitleEl.innerHTML = t("wasd_title");
        }
        return;
    }

    let currentPlate = 1;
    let keyCount = 0;

    steps.forEach((step, moveIndex) => {
        const group = document.createElement("span");
        group.className = "wasd-group";
        group.dataset.moveIndex = String(moveIndex);

        const nextPlate = step.plateIndex + 1;
        const delta = nextPlate - currentPlate;
        const navKey = delta > 0 ? "W" : "S";
        const navClass = delta > 0 ? "up" : "down";

        for (let index = 0; index < Math.abs(delta); index++) {
            group.appendChild(createWasdKey(navKey, navClass));
            keyCount++;
        }

        group.appendChild(
            createWasdKey(
                step.direction > 0 ? "D" : "A",
                step.direction > 0 ? "right" : "left",
            ),
        );
        keyCount++;
        wasdOutputEl.appendChild(group);
        currentPlate = nextPlate;
    });

    if (wasdTitleEl) {
        wasdTitleEl.innerHTML = t("wasd_title_count", {
            count: keyCount,
        });
    }

    updateActiveWasdGroup();
}

function createWasdKey(key, className) {
    const element = document.createElement("span");
    element.className = `wasd-key ${className}`;
    element.textContent = key;
    return element;
}

function createStepWasdKeys(step, previousPlate) {
    const container = document.createElement("div");
    container.className = "step-wasd";

    if (!step) {
        return container;
    }

    const nextPlate = step.plateIndex + 1;
    const delta = nextPlate - previousPlate;
    const navKey = delta > 0 ? "W" : "S";
    const navClass = delta > 0 ? "up" : "down";

    for (let index = 0; index < Math.abs(delta); index++) {
        container.appendChild(createWasdKey(navKey, navClass));
    }

    container.appendChild(
        createWasdKey(
            step.direction > 0 ? "D" : "A",
            step.direction > 0 ? "right" : "left",
        ),
    );

    return container;
}

function updateActiveWasdGroup() {
    wasdOutputEl
        .querySelectorAll(".wasd-group.active")
        .forEach((group) => {
            group.classList.remove("active");
        });

    if (activeSolutionStage <= 0) {
        return;
    }

    const activeMoveIndex = activeSolutionStage - 1;
    wasdOutputEl
        .querySelector(
            `.wasd-group[data-move-index="${activeMoveIndex}"]`,
        )
        ?.classList.add("active");
}

function computeWasdKeyCount(steps) {
    if (!steps || steps.length === 0) return 0;
    let count = 0;
    let currentPlate = 1;
    steps.forEach((step) => {
        const nextPlate = step.plateIndex + 1;
        const delta = nextPlate - currentPlate;
        count += Math.abs(delta);
        count += 1;
        currentPlate = nextPlate;
    });
    return count;
}

function buildSolutionTimeline(initialState, steps) {
    const timeline = [
        {
            label: t("start"),
            before: initialState,
            after: initialState,
            state: initialState,
            nextStep: steps[0] ?? null,
            step: null,
        },
    ];

    steps.forEach((step, index) => {
        timeline.push({
            label: t("step", { number: index + 1 }),
            before: step.before,
            after: step.after,
            state: step.after,
            nextStep: steps[index + 1] ?? null,
            step,
        });
    });

    return timeline;
}

function renderSolutionTimeline() {
    stepsEl.innerHTML = "";
    let previousPlate = 1;

    solutionTimeline.forEach((stage, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className =
            index === activeSolutionStage
                ? "step-card active"
                : "step-card";
        card.dataset.stageIndex = String(index);

        const head = document.createElement("div");
        head.className =
            stage.step?.direction > 0
                ? "step-head right"
                : "step-head";

        const title = document.createElement("div");
        title.textContent = stage.label;

        const stageMove = document.createElement("div");
        const wasdStep = stage.step;
        const wasdKeys = createStepWasdKeys(wasdStep, previousPlate);

        if (stage.step) {
            stageMove.appendChild(
                createMoveToken(stage.step, index - 1),
            );
        } else {
            stageMove.textContent = t("start");
        }

        if (stage.step) {
            previousPlate = stage.step.plateIndex + 1;
        }

        head.appendChild(title);
        head.appendChild(stageMove);
        head.appendChild(wasdKeys);

        card.appendChild(head);
        card.addEventListener("click", () => {
            stopSolutionPlayback();
            setActiveSolutionStage(index, { scroll: false });
        });

        stepsEl.appendChild(card);
    });
}

function updateSolutionControls() {
    const hasTimeline = solutionTimeline.length > 0;
    const canAnimate = solutionTimeline.length > 1;

    solutionStartBtn.disabled =
        !canAnimate || activeSolutionStage <= 0;
    solutionPrevBtn.disabled =
        !canAnimate || activeSolutionStage <= 0;
    solutionNextBtn.disabled =
        !canAnimate ||
        activeSolutionStage >= solutionTimeline.length - 1;
    solutionPlayBtn.disabled = !canAnimate;
    solutionPlayBtn.textContent = isSolutionPlaying
        ? t("pause")
        : t("play");
    solutionPlayBtn.hidden = !hasTimeline;
    solutionStartBtn.hidden = !hasTimeline;
    solutionPrevBtn.hidden = !hasTimeline;
    solutionNextBtn.hidden = !hasTimeline;
}

function setActiveSolutionStage(stageIndex, options = {}) {
    if (solutionTimeline.length === 0) {
        updateSolutionControls();
        return;
    }

    const nextStageIndex = clamp(
        stageIndex,
        0,
        solutionTimeline.length - 1,
    );
    const stage = solutionTimeline[nextStageIndex];

    activeSolutionStage = nextStageIndex;
    demoPositions = [...stage.state];
    if (mode === MODE_PREVIEW) {
        renderPlateStack();
        renderStatePreview(stage.before, demoPositions);
    }

    stepsEl.querySelectorAll(".step-card").forEach((card) => {
        card.classList.toggle(
            "active",
            Number(card.dataset.stageIndex) === activeSolutionStage,
        );
    });
    document
        .querySelectorAll(".move-token.active")
        .forEach((token) => {
            token.classList.remove("active");
        });

    if (activeSolutionStage > 0) {
        const activeMoveIndex = activeSolutionStage - 1;
        document
            .querySelectorAll(
                `.move-token[data-move-index="${activeMoveIndex}"]`,
            )
            .forEach((token) => {
                token.classList.add("active");
            });
    }

    updateActiveWasdGroup();

    if (options.scroll) {
        stepsEl
            .querySelector(
                `[data-stage-index="${activeSolutionStage}"]`,
            )
            ?.scrollIntoView({
                block: "nearest",
            });
    }

    updateSolutionControls();
}

function toggleSolutionPlayback() {
    if (isSolutionPlaying) {
        stopSolutionPlayback();
        return;
    }

    startSolutionPlayback();
}

function startSolutionPlayback() {
    if (solutionTimeline.length <= 1) {
        updateSolutionControls();
        return;
    }

    if (activeSolutionStage >= solutionTimeline.length - 1) {
        setActiveSolutionStage(0);
    }

    isSolutionPlaying = true;
    updateSolutionControls();
    const playbackDelay = 700 / playbackSpeed;
    solutionPlayTimer = window.setInterval(() => {
        if (activeSolutionStage >= solutionTimeline.length - 1) {
            stopSolutionPlayback();
            return;
        }

        setActiveSolutionStage(activeSolutionStage + 1, {
            scroll: true,
        });
    }, playbackDelay);
}

function stopSolutionPlayback() {
    if (solutionPlayTimer !== null) {
        window.clearInterval(solutionPlayTimer);
        solutionPlayTimer = null;
    }

    isSolutionPlaying = false;
    updateSolutionControls();
}

function createSolverWorker() {
    const worker = new Worker("solver.worker.js");

    worker.addEventListener("message", handleSolverMessage);
    worker.addEventListener("error", (event) => {
        showSolverError(
            t("solver_failed"),
        );
        console.error(event.message);
    });

    return worker;
}

async function getSolutionForAlgorithm(algorithm) {
    const cached = getCachedSolution(algorithm);
    if (cached !== undefined) {
        return cached;
    }

    return new Promise((resolve) => {
        let worker;
        try {
            worker = new Worker("solver.worker.js");
        } catch (e) {
            resolve(null);
            return;
        }

        const requestId =
            "best-" +
            Date.now() +
            "-" +
            Math.random().toString(36).slice(2);

        const timeout = setTimeout(() => {
            try {
                worker.terminate();
            } catch {}
            resolve(null);
        }, 30000);

        worker.addEventListener("message", (event) => {
            const msg = event.data ?? {};
            if (msg.requestId !== requestId) return;

            clearTimeout(timeout);
            try {
                worker.terminate();
            } catch {}

            let sol = null;
            if (msg.type === "solved") {
                sol = msg.solution;
                if (sol) setCachedSolution(algorithm, sol);
            }
            resolve(sol);
        });

        worker.addEventListener("error", () => {
            clearTimeout(timeout);
            try {
                worker.terminate();
            } catch {}
            resolve(null);
        });

        worker.postMessage({
            type: "solve",
            requestId,
            algorithm,
            plateCount,
            initialPositions: [...initialPositions],
            effectsRight: effectsRight.map((row) => [...row]),
            min: MIN,
            max: MAX,
            target: TARGET,
        });
    });
}

function cancelActiveSolve() {
    activeSolveRequestId++;
    closeSolverWorker();

    isSolving = false;
    solveBtn.disabled = false;
    if (bestBtn) bestBtn.disabled = false;
    updateSetupLock();
}

function closeSolverWorker() {
    if (!solverWorker) {
        return;
    }

    solverWorker.terminate();
    solverWorker = null;
}

function handleSolverMessage(event) {
    const message = event.data ?? {};

    if (message.requestId !== activeSolveRequestId) {
        return;
    }

    isSolving = false;
    solveBtn.disabled = false;
    closeSolverWorker();
    if (bestBtn) bestBtn.disabled = false;
    updateSetupLock();

    if (message.type === "failed") {
        showSolverError(message.reason || t("generic_solver_failed"));
        return;
    }

    if (message.type !== "solved") {
        return;
    }

    if (message.solution) {
        const algo = message.algorithm || algorithmSelect.value;
        setCachedSolution(algo, message.solution);
    }
    renderSolvedPath([...initialPositions], message.solution);
}

function showSolverError(message) {
    cancelActiveSolve();
        statusTextEl.textContent = message;
        statusTextEl.classList.add("error");
        comboTextEl.textContent = t("unable_calculate");
    renderStatePreview(initialPositions, initialPositions);
}

function renderSolvedPath(initialState, solution) {
    if (solution === null) {
        statusTextEl.textContent = t("no_solution");
        statusTextEl.classList.add("error");
        comboTextEl.textContent = t("check_shift_effects");
        renderStatePreview(initialState, initialState);
        updatePreviewOnlyVisibility();
        return;
    }

    statusTextEl.classList.remove("error");
    solutionSteps = solution;
    solutionTimeline = buildSolutionTimeline(
        initialState,
        solutionSteps,
    );
    activeSolutionStage = 0;

    if (solution.length === 0) {
            statusTextEl.textContent = t("already_open");
            comboTextEl.textContent = t("all_target");
        renderWasdTranscription(solutionSteps);
        renderSolutionTimeline();
        setActiveSolutionStage(0);
        updatePreviewOnlyVisibility();
        return;
    }

        statusTextEl.textContent = t("solution_found", {
            count: solution.length,
        });
    renderMoveTokens(comboTextEl, solutionSteps);
    renderWasdTranscription(solutionSteps);
    renderSolutionTimeline();
    setActiveSolutionStage(0);
    updatePreviewOnlyVisibility();
}

async function findBestSolution() {
    if (isSolving) return;

    setMode(MODE_PREVIEW);

    isSolving = true;
    solveBtn.disabled = true;
    if (bestBtn) bestBtn.disabled = true;
    updateSetupLock();

    const solvingTitleEl = document.querySelector(".solving-title");
    const solvingTextEl = document.querySelector(".solving-text");
    const overlay = document.getElementById("solvingOverlay");

    const prevTitle = solvingTitleEl
        ? solvingTitleEl.textContent
        : "";
    const prevText = solvingTextEl ? solvingTextEl.textContent : "";

    if (solvingTitleEl)
        solvingTitleEl.textContent = t("evaluating_algorithms");
    if (solvingTextEl)
        solvingTextEl.textContent = t("evaluating_text");
    if (overlay) overlay.classList.add("active");
    statusTextEl.classList.remove("error");
    comboTextEl.textContent = t("checking_algorithms");

    const algos = [
        { id: "bfs", label: "BFS shortest" },
        { id: "plate-travel", label: "Plate travel" },
        {
            id: "fewer-switches-fast",
            label: "Fast switches",
        },
        { id: "wasd", label: "WASD" },
    ];

    try {
        let best = null;
        let bestCount = Infinity;

        setBestProgress(0, algos.length, t("progress_starting"));

        for (const [index, algo] of algos.entries()) {
            const step = index + 1;
            setBestProgress(
                index,
                algos.length,
                t("progress_running", { label: algo.label }),
            );
            statusTextEl.textContent = t("best_search", {
                step,
                total: algos.length,
                label: algo.label,
            });
            if (solvingTextEl) {
                solvingTextEl.textContent = t("checking_algo", {
                    label: algo.label,
                    step,
                    total: algos.length,
                });
            }
            await new Promise((resolve) =>
                requestAnimationFrame(resolve),
            );

            let solution = getCachedSolution(algo.id);
            if (solution === undefined) {
                solution = await getSolutionForAlgorithm(algo.id);
            }

            if (solution && !solution.timeout) {
                const count = computeWasdKeyCount(solution);
                if (count < bestCount) {
                    bestCount = count;
                    best = { algo: algo.id, solution, count };
                }
            }

            setBestProgress(
                step,
                algos.length,
                t("progress_done", { label: algo.label }),
            );
        }

        if (best && best.solution) {
            algorithmSelect.value = best.algo;
            const initialState = [...initialPositions];
            renderSolvedPath(initialState, best.solution);

            if (statusTextEl) {
                statusTextEl.textContent = t("solution_found_auto", {
                    count: best.solution.length,
                });
            }
        } else {
            if (statusTextEl) {
                statusTextEl.textContent = t("no_solution_any");
                statusTextEl.classList.add("error");
            }
        }
    } finally {
        setBestProgress(algos.length, algos.length, t("progress_complete"));
        if (solvingTitleEl) solvingTitleEl.textContent = prevTitle;
        if (solvingTextEl) solvingTextEl.textContent = prevText;
        if (overlay) overlay.classList.remove("active");

        isSolving = false;
        solveBtn.disabled = false;
        if (bestBtn) bestBtn.disabled = false;
        updateSetupLock();
        window.setTimeout(hideBestProgress, 700);
    }
}

function applyCachedAlgorithmSolution() {
    const cached = getCachedSolution(algorithmSelect.value);

    if (cached === undefined) {
        clearSolution();
        return false;
    }

    const initialState = [...initialPositions];
    demoPositions = [...initialState];
    clearSolution({ resetStatus: false });
    renderSolvedPath(initialState, cached);
    return true;
}

function solve() {
    setMode(MODE_PREVIEW);

    const initialState = [...initialPositions];
    const currentAlgo = algorithmSelect.value;

    const cached = getCachedSolution(currentAlgo);
    if (cached !== undefined) {
        demoPositions = [...initialState];
        clearSolution({ resetStatus: false });
        renderSolvedPath(initialState, cached);
        return;
    }

    demoPositions = [...initialState];
    clearSolution({ resetStatus: false });

    activeSolveRequestId++;
    const requestId = activeSolveRequestId;

    try {
        solverWorker = createSolverWorker();
    } catch (error) {
        showSolverError(
            t("solver_unavailable"),
        );
        return;
    }

    isSolving = true;
    solveBtn.disabled = true;
    if (bestBtn) bestBtn.disabled = true;
    updateSetupLock();
    statusTextEl.textContent = t("calculating");
    statusTextEl.classList.remove("error");
    comboTextEl.textContent = t("please_wait");
    renderStatePreview(initialState, initialState);

    solverWorker.postMessage({
        type: "solve",
        requestId,
        algorithm: algorithmSelect.value,
        plateCount,
        initialPositions: initialState,
        effectsRight: effectsRight.map((row) => [...row]),
        min: MIN,
        max: MAX,
        target: TARGET,
    });
}

function clearSolution(options = {}) {
    const { resetStatus = true } = options;

    cancelActiveSolve();
    stopSolutionPlayback();
    solutionSteps = [];
    solutionTimeline = [];
    activeSolutionStage = 0;
    demoPositions = [...initialPositions];

    if (resetStatus) {
            statusTextEl.textContent = t("waiting_setup");
            statusTextEl.classList.remove("error");
            comboTextEl.textContent = "—";
    }

    stepsEl.innerHTML = "";
        wasdOutputEl.innerHTML = `<span class="wasd-empty">${t("wasd_empty")}</span>`;

    const wasdTitleEl = document.getElementById("wasdTitle");
    if (wasdTitleEl) {
            wasdTitleEl.innerHTML = t("wasd_title");
    }

    updateSolutionControls();
    updatePreviewOnlyVisibility();
}

function openResetConfirmModal() {
    resetConfirmModal.hidden = false;
    confirmResetBtn.focus();
}

function closeResetConfirmModal() {
    resetConfirmModal.hidden = true;
    resetBtn.focus();
}

function reset() {
    templateSelect.value = "";
    updateLocationCode(null);
    syncTemplateReadonly();
    mode = MODE_SETUP;
    plateCount = 5;
    activePlate = 0;
    initialPositions = [4, 4, 4, 4, 4];
    shiftPositions = [...initialPositions];
    demoPositions = [...initialPositions];
    effectsRight = createIdentityEffects(plateCount);

    invalidateSolutionCache();
    clearSolution();
    setMode(MODE_SETUP);
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
renderTemplateSelect();
syncTemplateReadonly();
algorithmSelect.value = "wasd";
loadPlateHitImage();
if (!applyQueryCode()) {
    render();
    statusTextEl.textContent = t("waiting_setup");
} else if (hasPreviewQuery()) {
    setMode(MODE_PREVIEW);
    solve();
}
updateSolutionControls();
