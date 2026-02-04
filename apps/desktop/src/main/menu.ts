import { app, Menu, MenuItemConstructorOptions, BrowserWindow } from "electron";

// Forward declaration or import of the function type if it's complex
// For simplicity, we assume createOrShowSettingsWindow is a () => void function

export const setupApplicationMenu = (
  createOrShowSettingsWindow: () => void,
  checkForUpdates?: () => void,
  openAllDevTools?: () => void,
) => {
  const menuTemplate: MenuItemConstructorOptions[] = [
    // { role: 'appMenu' } for macOS
    ...(process.platform === "darwin"
      ? ([
          {
            label: app.name,
            submenu: [
              { role: "about" as const, label: `${app.name} について` },
              { type: "separator" as const },
              ...(checkForUpdates
                ? [
                    {
                      label: "アップデートを確認...",
                      click: () => checkForUpdates(),
                    } as MenuItemConstructorOptions,
                    { type: "separator" as const },
                  ]
                : []),
              {
                label: "設定...",
                accelerator: "CmdOrCtrl+,",
                click: () => createOrShowSettingsWindow(),
              },
              { type: "separator" as const },
              { role: "services" as const, label: "サービス" },
              { type: "separator" as const },
              { role: "hide" as const, label: `${app.name} を隠す` },
              { role: "hideOthers" as const, label: "ほかを隠す" },
              { role: "unhide" as const, label: "すべてを表示" },
              { type: "separator" as const },
              { role: "quit" as const, label: `${app.name} を終了` },
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    // { role: 'fileMenu' } for Windows/Linux
    ...(process.platform !== "darwin"
      ? ([
          {
            label: "ファイル",
            submenu: [
              {
                label: "設定...",
                accelerator: "CmdOrCtrl+,",
                click: () => createOrShowSettingsWindow(),
              },
              { type: "separator" as const },
              { role: "quit" as const, label: "終了" },
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    // { role: 'editMenu' }
    {
      label: "編集",
      submenu: [
        { role: "undo" as const, label: "元に戻す" },
        { role: "redo" as const, label: "やり直す" },
        { type: "separator" as const },
        { role: "cut" as const, label: "カット" },
        { role: "copy" as const, label: "コピー" },
        { role: "paste" as const, label: "ペースト" },
        ...(process.platform === "darwin"
          ? [
              {
                role: "pasteAndMatchStyle" as const,
                label: "ペーストしてスタイルを合わせる",
              },
              { role: "delete" as const, label: "削除" },
              { role: "selectAll" as const, label: "すべてを選択" },
              { type: "separator" as const },
              {
                label: "スピーチ",
                submenu: [
                  { role: "startSpeaking" as const, label: "読み上げを開始" },
                  { role: "stopSpeaking" as const, label: "読み上げを停止" },
                ],
              },
            ]
          : [
              { role: "delete" as const, label: "削除" },
              { type: "separator" as const },
              { role: "selectAll" as const, label: "すべてを選択" },
            ]),
      ],
    },
    // { role: 'viewMenu' }
    {
      label: "表示",
      submenu: [
        { role: "reload" as const, label: "再読み込み" },
        { role: "forceReload" as const, label: "強制的に再読み込み" },
        { role: "toggleDevTools" as const, label: "開発者ツールを表示/非表示" },
        ...(openAllDevTools
          ? [
              {
                label: "すべての開発者ツールを開く",
                accelerator: "CmdOrCtrl+Shift+I",
                click: () => openAllDevTools(),
              } as MenuItemConstructorOptions,
            ]
          : []),
        { type: "separator" as const },
        { role: "resetZoom" as const, label: "実際のサイズ" },
        { role: "zoomIn" as const, label: "拡大" },
        { role: "zoomOut" as const, label: "縮小" },
        { type: "separator" as const },
        { role: "togglefullscreen" as const, label: "フルスクリーンを切り替え" },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: "ウィンドウ",
      submenu: [
        { role: "minimize" as const, label: "しまう" },
        { role: "zoom" as const, label: "拡大/縮小" },
        ...(process.platform === "darwin"
          ? [
              { type: "separator" as const },
              { role: "front" as const, label: "すべてを手前に移動" },
              { type: "separator" as const },
              { role: "close" as const, label: "閉じる" },
            ]
          : [{ role: "close" as const, label: "閉じる" }]),
      ],
    },
    {
      label: "ヘルプ",
      role: "help" as const,
      submenu: [
        {
          label: "使い方を見る",
          click: async () => {
            const { shell } = await import("electron");
            shell.openExternal("https://www.sura2.net/docs");
          },
        },
        { type: "separator" as const },
        ...(checkForUpdates
          ? [
              {
                label: "アップデートを確認...",
                click: () => checkForUpdates(),
              } as MenuItemConstructorOptions,
              { type: "separator" as const },
            ]
          : []),
        {
          label: "公式サイトを見る",
          click: async () => {
            const { shell } = await import("electron");
            shell.openExternal("https://www.sura2.net");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // Add "Version" prefix on macOS About panel
  if (process.platform === "darwin") {
    app.setAboutPanelOptions({
      applicationVersion: `バージョン ${app.getVersion()}`,
    });
  }
};
