window.cloudinaryUp = (editor, opts = {}) => {
    const options = {
        ...{
            // default options
            // Custom button element which triggers Uppy modal
            btnEl: '',

            // Text for the button in case the custom one is not provided
            btnText: 'Upload images',

            // Uppys's options
            cloudinaryOpts: {},

            // On complete upload callback
            // asset - Assets object, eg. {url:'...', filename: 'name.jpeg', ...}
            // for debug: console.log(asset);
            onComplete(asset) {
                console.log('successful file:', asset);
            },

            // Handle events
            onEvent(ev) {
                console.log('info: ', ev);
            },

            // On failed upload callback
            // asset - Assets object, eg. {url:'...', filename: 'name.jpeg', ...}
            // for debug: console.log(asset);
            onFailed(asset) {
                console.log('failed file:', asset);
            },
        },
        ...opts
    };

    let btnEl;
    const pfx = editor.getConfig('stylePrefix');
    const { $ } = editor;
    const { cloudinaryOpts } = options;
    let cloudinaryWidget = window.cloudinary.createUploadWidget({
        cloudName: 'blocomposer',
        uploadPreset: 'blocomposer_images',
        sources: [
            'local',
            'url',
            'camera',
            'image_search',
            'google_drive',
            'facebook',
            'dropbox',
            'instagram',
            'shutterstock',
            'getty',
            'istock',
            'unsplash'
        ],
        showAdvancedOptions: true,
        cropping: false,
        multiple: true,
        defaultSource: 'local',
        styles: {
            palette: {
                window: '#10173a',
                sourceBg: '#20304b',
                windowBorder: '#7171d0',
                tabIcon: '#79f7ff',
                inactiveTabIcon: '#8e9fbf',
                menuIcons: '#cce8ff',
                link: '#72f1ff',
                action: '#5333ff',
                inProgress: '#00ffcc',
                complete: '#33ff00',
                error: '#cc3333',
                textDark: '#000000',
                textLight: '#ffffff'
            },
            fonts: {
                default: null,
                '\'IBM Plex Sans\', sans-serif': {
                    url: 'https://fonts.googleapis.com/css?family=IBM+Plex+Sans',
                    active: true,
                }
            }
        },
        ...cloudinaryOpts
    },
        (err, info) => {
            if (!err) {
                const { event } = info;
                if (event === 'success') {
                    addAsset(info.info);
                    options.onComplete(info.info);
                }
                else {
                    options.onEvent(info);
                }
            } else {
                options.onFailed(err);
            }
        }
    );

    // When the Asset Manager modal is opened
    editor.on('run:open-assets', () => {
        const modal = editor.Modal;
        const modalBody = modal.getContentEl();
        const uploader = modalBody.querySelector(`.${pfx}am-file-uploader`);
        const assetsHeader = modalBody.querySelector(`.${pfx}am-assets-header`);
        const assetsBody = modalBody.querySelector(`.${pfx}am-assets-cont`);

        uploader && (uploader.style.display = 'none');
        assetsBody.style.width = '100%';

        const showUploadWidget = () => {
            cloudinaryWidget.open();
        }

        // Instance button if not yet exists
        if (!btnEl) {
            btnEl = options.btnEl ? $(options.btnEl) : $(`<button class="${pfx}btn-prim ${pfx}btn-cloudinary">
                    ${options.btnText}
                </button>`);
            btnEl.on('click', showUploadWidget);
        }

        assetsHeader.appendChild(btnEl.get(0));
    });

    /**
     * Add new assets to the editor
     * @param {Object} file
     */
    const addAsset = (file) => {
        return editor.AssetManager.add({
            id: file.asset_id,
            name: file.original_filename,
            size: file.bytes,
            src: file.url
        });
    };
};