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
              { role: "about" as const },
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
                label: "設定",
                accelerator: "CmdOrCtrl+,",
                click: () => createOrShowSettingsWindow(),
              },
              { type: "separator" as const },
              { role: "services" as const },
              { type: "separator" as const },
              { role: "hide" as const },
              { role: "hideOthers" as const },
              { role: "unhide" as const },
              { type: "separator" as const },
              { role: "quit" as const },
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
                label: "設定",
                accelerator: "CmdOrCtrl+,",
                click: () => createOrShowSettingsWindow(),
              },
              { type: "separator" as const },
              { role: "quit" as const },
            ],
          },
        ] as MenuItemConstructorOptions[])
      : []),
    // { role: 'editMenu' }
    {
      label: "編集",
      submenu: [
        { role: "undo" as const },
        { role: "redo" as const },
        { type: "separator" as const },
        { role: "cut" as const },
        { role: "copy" as const },
        { role: "paste" as const },
        ...(process.platform === "darwin"
          ? [
              { role: "pasteAndMatchStyle" as const },
              { role: "delete" as const },
              { role: "selectAll" as const },
              { type: "separator" as const },
              {
                label: "スピーチ",
                submenu: [
                  { role: "startSpeaking" as const },
                  { role: "stopSpeaking" as const },
                ],
              },
            ]
          : [
              { role: "delete" as const },
              { type: "separator" as const },
              { role: "selectAll" as const },
            ]),
      ],
    },
    // { role: 'viewMenu' }
    {
      label: "表示",
      submenu: [
        { role: "reload" as const },
        { role: "forceReload" as const },
        { role: "toggleDevTools" as const },
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
        { role: "resetZoom" as const },
        { role: "zoomIn" as const },
        { role: "zoomOut" as const },
        { type: "separator" as const },
        { role: "togglefullscreen" as const },
      ],
    },
    // { role: 'windowMenu' }
    {
      label: "ウィンドウ",
      submenu: [
        { role: "minimize" as const },
        { role: "zoom" as const },
        ...(process.platform === "darwin"
          ? [
              { type: "separator" as const },
              { role: "front" as const },
              { type: "separator" as const },
              { role: "window" as const },
              { type: "separator" as const },
              { role: "close" as const },
            ]
          : [{ role: "close" as const }]),
      ],
    },
    {
      role: "help" as const,
      submenu: [
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
          label: "詳しく見る",
          click: async () => {
            const { shell } = await import("electron");
            shell.openExternal("https://electronjs.org");
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
