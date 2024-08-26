
/**
 * ツールボックスの初期化
 */
function initToolBox(tabs) {

    const $toolbox = $('#toolbox');

    // タブの作成
    let tabLinks = '';
    let tabContents = '';
    tabs.forEach(tab => {
        tabLinks += `<button class="tab-link" data-tab="${tab.id}">${tab.label}</button>`;
        let content = '';
        tab.controls.forEach(control => {
            content += `<div class="cnt-control" id="${control.id}">
                <h3>${control.title}</h3>${control.content}
            </div>`
        });
        
        tabContents += `<div class="tab-content" id="${tab.id}" style="display: none;">${content}</div>`;
    });

    $toolbox.html(`
        <div class="tab-links">${tabLinks}</div>
        <div class="tab-contents">${tabContents}</div>
    `);
    //  初期化関数の実行
    tabs.forEach(tab => {
        tab.controls.forEach(control => {
            control.initialize();
        });
    });

    // 初期表示設定
    $('.tab-content').first().show();
    $('.tab-link').first().addClass('active');

    // タブクリック時の処理
    $('.tab-link').on('click', function() {
        const targetTab = $(this).data('tab');

        // タブリンクのアクティブ状態を更新
        $('.tab-link').removeClass('active');
        $(this).addClass('active');

        // タブコンテンツの表示切替
        $('.tab-content').hide();
        $(`#${targetTab}`).show();
    });
};

/**
 * 拡大率の更新
 * @param {number} zoomLevel 拡大率 
 */
function updateZoom(zoomLevel) {
    const $zoomSlider = $('#zoom-slider');
    const $paperContainer = $('#paper-container');
    const $zoomLevel = $('#zoom-level');
    const $form = $('.cfe-form');
    const $page = $('.cfe-page').eq(0);
    //  スクロールバー表示
    let scrollLevel = getZoomValue(4);
    // スライダーに値を設定
    $zoomSlider.val(zoomLevel * 100);
    //  ページの拡大と拡大率の書き込み
    $form.css('transform', `scale(${zoomLevel})`);
    $zoomLevel.text(`${Math.round(zoomLevel * 100)}%`);

    //  コンテナのサイズ
    const containerWidth = $paperContainer.innerWidth();
    const containerHeight = $paperContainer.innerHeight();

    // 用紙のサイズと位置を再計算
    const newPaperWidth = $page.outerWidth();
    const newPaperHeight = $page.outerHeight();

    // コンテナの中心に対する用紙の中央位置を計算
    const scrollLeft = (newPaperWidth - containerWidth) / 2;
    const scrollTop = (newPaperHeight - containerHeight) / 2;

    // スクロール位置を調整
    $paperContainer.scrollLeft(scrollLeft);
    $paperContainer.scrollTop(scrollTop);
}

/**
 * インデックスに従った拡大率を取得する
 * @param {number} idx 0: ページ全体、1:幅横幅いっぱい、2:100%
 *                      3:ページ全体（マージンなし） 
 * @returns 拡大率
 */
function getZoomValue(idx) {
    const $paper = $('.cfe-page').eq(0);
    const $paperContainer = $('#paper-container');
    // 用紙とコンテナのサイズを取得
    const paperWidth = $paper.outerWidth();
    const paperHeight = $paper.outerHeight();
    const containerWidth = $paperContainer.innerWidth();
    const containerHeight = $paperContainer.innerHeight();
    // 用紙がコンテナに収まるための拡大率を計算
    const scaleX = containerWidth / paperWidth;
    const scaleY = containerHeight / paperHeight;

    let zoomValue = 1;
    if(idx==0) {
        zoomValue = Math.min(scaleX, scaleY) * 0.92;
    } else if(idx==1) {
        zoomValue = scaleX * 0.92;
    } else if(idx==4) {
        zoomValue = Math.min(scaleX, scaleY);
    }
    return zoomValue;
}

/**
 * 拡大縮小ツールの初期化
 */
function initZoomControls() {
    const $zoomIn = $('#zoom-in');
    const $zoomOut = $('#zoom-out');
    const $zoomLevel = $('#zoom-level');
    const $zoomSlider = $('#zoom-slider');

    // スライダーの変更イベント
    $zoomSlider.on('input', function() {
        let zoomLevel = $zoomSlider.val() / 100;
        updateZoom(zoomLevel);
    });

    // 拡大ボタンのクリックイベント
    $zoomIn.on('click', function() {
        let zoomLevel = $zoomSlider.val() / 100;
        zoomLevel = Math.min(zoomLevel + 0.2, 2); // 最大200%まで
        updateZoom(zoomLevel);
    });

    // 縮小ボタンのクリックイベント
    $zoomOut.on('click', function() {
        let zoomLevel = $zoomSlider.val() / 100;
        zoomLevel = Math.max(zoomLevel - 0.2, 0.2); // 最小20%まで
        updateZoom(zoomLevel);
    });

    //  拡大率表示のクリックイベント
    $zoomLevel.on('click', function() {
        let zoomIdx = $zoomSlider.val();
        let zoomLevels = [
            getZoomValue(0),
            getZoomValue(1),
            getZoomValue(2),
        ];
        zoomLevels.sort((a,b) => {
            return a - b;
        });
        for(var i=0; i<3; i++ ) {
            if(zoomIdx < Math.floor(zoomLevels[i] * 100)) {
                updateZoom(zoomLevels[i]);
                break;
            }
        }
        if(i==3) {
            updateZoom(zoomLevels[0]);
        }
    });
}

/**
 * 初期化
 */
$(document).ready(function() {
    //  拡大縮小コントロールの初期化
    initZoomControls();

    //  ツールボックスの初期化
    initToolBox(TABS);
    newForm('form-1');
    
    // 初期拡大率を設定
    let zoomLevel = getZoomValue(0);
    updateZoom(zoomLevel);
});
