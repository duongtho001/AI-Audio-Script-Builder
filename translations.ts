import type { StorySuggestion, VideoConfig } from './types';

export type Language = 'en' | 'vi';

const en = {
    // App.tsx
    untitledProject: "Untitled Story Project",
    generationStatusPreparing: "Preparing...",
    generationIncompleteError: (current: number, total: number) => `Incomplete. ${current}/${total} generated.`,
    generationFailedCanResume: (errorMsg: string) => `Failed: ${errorMsg}.`,
    processingScript: "Breaking script into scenes...",
    processingManualScenes: "Analyzing story context & writing scripts...",
    generatingAudioForScene: (current: number, total: number) => `Generating Audio for Scene ${current} of ${total}...`,
    fullAudioTitle: "Full Story Audio",
    fullAudioDescription: "All generated scene audios merged into one track.",
    downloadAudioButton: "Download Full MP3",

    // Header.tsx
    appTitle: "AI Audio Script Builder",
    appDescription: "Script to Audio & Prompts",
    newProjectButton: "New Project",
    guideButtonTooltip: "User Guide",
    apiKeyButtonTooltip: "API Key Settings",
    languageLabel: "Language",

    // InputPanel.tsx
    inputModeLabel: "Input Mode",
    modeScript: "Full Script (AI Split)",
    modeSceneList: "Manual Scene List (Bulk)",
    
    scriptInputLabel: "Script / Story Input",
    scriptPlaceholder: "Paste your full story or script here. The AI will split it into 8-second scenes...",
    
    manualSceneInputLabel: "Bulk Scene Input",
    manualPlaceholder: "1. A man walks down the street.\n2. He sees a cat.\n3. The cat meows.\n\n(Format: Numbered list or one scene per line)",
    
    uploadTxtButton: "Upload .txt",
    videoSettingsLabel: "Style & Audio Settings",
    durationFeedback: (scenes: number, mins: number, secs: number) => `~${scenes} scenes (~${mins}m ${secs}s).`,
    videoFormatLabel: "Pace",
    voiceToneLabel: "Voice Tone / Narrator",
    outputLanguageLabel: "Output Language (Audio)",
    audioStyleLabel: "Audio Style / Mood",
    audioStylePlaceholder: "e.g., Cinematic, Suspenseful, Happy background music...",
    suggestionsLabel: "Suggestions:",
    
    analyzeScriptButton: "Analyze Script & Plan Story",
    generateFromScenesButton: "Generate Audio & Prompts",
    
    suggestingStory: "Analyzing Script...",
    storySuggestionTitle: "Story Plan",
    storyConceptLabel: "Core Concept",
    visualStyleLabel: "Visual Style (for Prompts)",
    visualStylePlaceholder: "Edit visual style here...",
    acceptAndGenerateButton: "Generate Audio",
    tryAgainButton: "Refine",
    
    // SceneTimeline.tsx
    timelineTitle: "Timeline & Audio",
    downloadButton: "Download Prompts",
    downloadSrtButton: "Download SRT (Subs)",
    downloadZipButton: "Download Audio Zip (Ordered)",
    emptyTimelineTitle: "Empty Storyboard",
    emptyTimelineDescription: "Analyze a script or add manual scenes to begin.",

    // SceneCard.tsx
    sceneLabel: "Scene",
    timeLabel: "Time",
    promptLabel: "Prompt / Script",
    promptHelperTooltip: "Helper",
    invalidJsonError: "Invalid JSON",
    playAudio: "Play Audio",
    downloadSceneAudio: "Download",

    // Loader.tsx
    generationComplete: "Complete!",
    generatingScene: (current: number, total: number) => `Scene ${current}/${total}`,
    loaderText: "Processing...",

    // ConfirmationModal.tsx
    newProjectConfirmationTitle: "New Project?",
    newProjectConfirmationMessage: "Clear current work?",
    confirmButton: "Yes",
    cancelButton: "No",
    resumeGenerationTitle: "Resume?",
    resumeButton: "Resume",
    finishForNowButton: "Stop",

    // ApiKeyModal.tsx
    apiKeyModalTitle: "API Key Management",
    apiKeyModalDescription: "Enter multiple Google Gemini API Keys. If one quota is exhausted, the app will automatically rotate to the next key.",
    apiKeyModalPlaceholder: "Paste your API Keys here (one per line)...",
    apiKeyModalNotice: "Keys are stored locally in your browser.",
    apiKeyModalSaveButton: "Save Keys",

    // GuideModal.tsx
    guideModalTitle: "How to Use",
    guideSteps: [
        { title: "1. Choose Mode", description: "Select 'Full Script' to let AI split, or 'Manual Scene List' to paste a numbered list of scenes." },
        { title: "2. Settings", description: "Choose Output Language, Voice Tone and describe the Audio Mood." },
        { title: "3. Analyze/Generate", description: "Process the input to create the structure." },
        { title: "4. Audio Generation", description: "The app automatically creates TTS audio for every scene and merges them." },
        { title: "5. Download", description: "Download individual audio files, the merged audio, or an SRT subtitle file." },
    ],
    guideProTipsTitle: "Tips",
    guideProTips: [
        { title: "Manual Mode", description: "Use format '1. Scene description' for best results." },
        { title: "Audio Style", description: "Be specific about the background vibe (e.g., 'busy street noise', 'calm piano')." },
    ],

    promptHelperTitle: "Quick Adds",
    promptHelperTags: {
        camera_angles: { group: "Camera", tags: [] }, 
        lighting: { group: "Lighting", tags: [] },
        styles: { group: "Styles", tags: [] },
        details: { group: "Details", tags: [] },
    },
};

const vi = {
    // App.tsx
    untitledProject: "Dự án Kịch bản Mới",
    generationStatusPreparing: "Đang chuẩn bị...",
    generationIncompleteError: (current: number, total: number) => `Chưa hoàn tất. ${current}/${total} cảnh.`,
    generationFailedCanResume: (errorMsg: string) => `Thất bại: ${errorMsg}.`,
    processingScript: "Đang phân chia kịch bản thành các cảnh...",
    processingManualScenes: "Đang phân tích ngữ cảnh & viết lời bình...",
    generatingAudioForScene: (current: number, total: number) => `Đang tạo Âm thanh cho Cảnh ${current}/${total}...`,
    fullAudioTitle: "Âm thanh Toàn bộ",
    fullAudioDescription: "Tất cả các đoạn âm thanh đã được ghép lại.",
    downloadAudioButton: "Tải Audio Tổng (MP3)",

    // Header.tsx
    appTitle: "AI Audio Script Builder",
    appDescription: "Kịch bản sang Âm thanh & SRT",
    newProjectButton: "Dự án mới",
    guideButtonTooltip: "Hướng dẫn",
    apiKeyButtonTooltip: "Cài đặt API Key",
    languageLabel: "Ngôn ngữ",

    // InputPanel.tsx
    inputModeLabel: "Chế độ Nhập",
    modeScript: "Kịch bản Tổng (AI Tự chia)",
    modeSceneList: "Danh sách Cảnh (Thủ công)",

    scriptInputLabel: "Nhập Kịch bản / Cốt truyện",
    scriptPlaceholder: "Dán nội dung câu chuyện của bạn vào đây. AI sẽ tự động chia thành các cảnh 8 giây...",
    
    manualSceneInputLabel: "Nhập Danh Sách Cảnh",
    manualPlaceholder: "1. Một người đàn ông đi bộ.\n2. Anh ấy nhìn thấy con mèo.\n3. Con mèo kêu meo meo.\n\n(Định dạng: Số thứ tự hoặc xuống dòng cho mỗi cảnh)",

    uploadTxtButton: "Tải file .txt",
    videoSettingsLabel: "Cài đặt Âm thanh & Phong cách",
    durationFeedback: (scenes: number, mins: number, secs: number) => `~${scenes} cảnh (~${mins}p ${secs}s).`,
    videoFormatLabel: "Nhịp độ",
    voiceToneLabel: "Giọng đọc / Người dẫn chuyện",
    outputLanguageLabel: "Ngôn ngữ Đầu ra",
    audioStyleLabel: "Phong cách Âm thanh / Cảm xúc",
    audioStylePlaceholder: "ví dụ: Nhạc phim hùng tráng, Hồi hộp, Nhạc nền vui tươi...",
    suggestionsLabel: "Gợi ý:",
    
    analyzeScriptButton: "Phân tích & Lên kế hoạch",
    generateFromScenesButton: "Tạo Âm thanh & Prompts",

    suggestingStory: "Đang phân tích kịch bản...",
    storySuggestionTitle: "Kế hoạch Câu chuyện",
    storyConceptLabel: "Cốt lõi Câu chuyện",
    visualStyleLabel: "Phong cách Hình ảnh (cho Prompt)",
    visualStylePlaceholder: "Chỉnh sửa phong cách hình ảnh...",
    acceptAndGenerateButton: "Tạo Audio",
    tryAgainButton: "Thử lại",

    // SceneTimeline.tsx
    timelineTitle: "Danh sách & Audio",
    downloadButton: "Tải Prompts (TXT)",
    downloadSrtButton: "Tải Phụ đề (SRT)",
    downloadZipButton: "Tải Audio từng cảnh (Zip)",
    emptyTimelineTitle: "Danh sách Trống",
    emptyTimelineDescription: "Hãy phân tích kịch bản hoặc nhập cảnh thủ công để bắt đầu.",

    // SceneCard.tsx
    sceneLabel: "Cảnh",
    timeLabel: "Thời gian",
    promptLabel: "Nội dung / Prompt",
    promptHelperTooltip: "Trợ giúp",
    invalidJsonError: "Lỗi JSON",
    playAudio: "Nghe",
    downloadSceneAudio: "Tải về",

    // Loader.tsx
    generationComplete: "Hoàn tất!",
    generatingScene: (current: number, total: number) => `Cảnh ${current}/${total}`,
    loaderText: "Đang xử lý...",

    // ConfirmationModal.tsx
    newProjectConfirmationTitle: "Dự án mới?",
    newProjectConfirmationMessage: "Xóa dữ liệu hiện tại?",
    confirmButton: "Có",
    cancelButton: "Không",
    resumeGenerationTitle: "Tiếp tục?",
    resumeButton: "Tiếp tục",
    finishForNowButton: "Dừng",
    
    // ApiKeyModal.tsx
    apiKeyModalTitle: "Quản lý API Key",
    apiKeyModalDescription: "Nhập nhiều Google Gemini API Key. Nếu một key hết hạn mức, ứng dụng sẽ tự động chuyển sang key tiếp theo.",
    apiKeyModalPlaceholder: "Dán danh sách API Key vào đây (mỗi dòng 1 key)...",
    apiKeyModalNotice: "Key được lưu trữ cục bộ trên trình duyệt của bạn.",
    apiKeyModalSaveButton: "Lưu Key",

    // GuideModal.tsx
    guideModalTitle: "Hướng dẫn Sử dụng",
    guideSteps: [
        { title: "1. Chọn Chế độ", description: "Chọn 'Kịch bản Tổng' để AI tự chia, hoặc 'Danh sách Cảnh' để dán danh sách các cảnh đã đánh số." },
        { title: "2. Cài đặt", description: "Chọn Ngôn ngữ đầu ra, Giọng đọc và mô tả Phong cách Âm thanh." },
        { title: "3. Xử lý", description: "Nhấn nút Tạo để bắt đầu quy trình." },
        { title: "4. Âm thanh", description: "Hệ thống tự động tạo Audio TTS cho từng cảnh và ghép lại." },
        { title: "5. Tải về", description: "Tải file âm thanh từng cảnh, file SRT hoặc file âm thanh tổng hợp." },
    ],
    guideProTipsTitle: "Mẹo",
    guideProTips: [
        { title: "Chế độ Thủ công", description: "Sử dụng định dạng '1. Nội dung cảnh' để máy dễ nhận diện." },
        { title: "Phong cách Âm thanh", description: "Mô tả kỹ không khí (ví dụ: 'tiếng ồn phố xá', 'piano nhẹ nhàng')." },
    ],

    promptHelperTitle: "Thêm nhanh",
    promptHelperTags: {
        camera_angles: { group: "Góc máy", tags: [] },
        lighting: { group: "Ánh sáng", tags: [] },
        styles: { group: "Phong cách", tags: [] },
        details: { group: "Chi tiết", tags: [] },
    },
};

export const translations = {
  en,
  vi,
};

export type TranslationKeys = typeof en;