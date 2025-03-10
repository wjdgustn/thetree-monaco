document.addEventListener('thetree:pageLoad', () => {
    const tab = document.getElementById('plugin-thetree-monaco-tab');

    let monaco_editor;
    let valueCache;
    tab._thetree.editor.getValue = () => monaco_editor.getValue();
    tab._thetree.editor.setValue = value => {
        if(monaco_editor) monaco_editor.setValue(value);
        else valueCache = value;
    }

    const target = document.getElementById('thetree-monaco-area');
    require.config({
        paths: {
            'vs': '/plugins/thetree-monaco/vs',
            'namu': '/plugins/thetree-monaco/namu',
        },
    });
    require.config({
        'vs/nls' : {
            availableLanguages: {
                '*': 'ko'
            }
        }
    });
    require(['vs/editor/editor.main', 'namu/toolbar/quickaccess'], async () => {
        const { default: namumark_register } = await import('/plugins/thetree-monaco/namu/vs/languages/namumark.js');
        namumark_register(monaco);
        monaco_editor = monaco.editor.create(target, {
            language: 'namumark',
            automaticLayout: true,
            wordWrap: true,
            renderWhitespace: 'all',
            fontFamily: 'D2Coding, Consolas, "나눔고딕코딩", "Courier New", monospace',
            value: valueCache
        });

        const quickaccess = new namu.toolbar.QuickAccess(monaco_editor);
        tab._thetree.editor.quickaccess = quickaccess;

        const buttons = [...document.getElementsByClassName('plugin-thetree-monaco-button')];
        for(let button of buttons) {
            button.addEventListener('click', () => {
                quickaccess.apply({
                    bold: { bracket: `'''` },
                    italic: { bracket: `''` },
                    strike: { bracket: `~~` },
                    link: {
                        bracket: {
                            open: `[[`,
                            close: `]]`
                        }
                    },
                    file: {
                        bracket: {
                            open: `[[파일:`,
                            close: `]]`
                        }
                    },
                    footnote: {
                        bracket: {
                            open: `[* `,
                            close: `]`
                        }
                    },
                    include: {
                        bracket: {
                            open: `[include(`,
                            close: `)]`
                        }
                    }
                }[button.dataset.name]);
            });
        }
    });
}, { once: true });