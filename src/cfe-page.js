
/**
 * デフォルトのエディタ設定値
 */
const DEFAULT_EDITOR_SETTINGS = {
    PaperSize: {
        'size': 'A4',
        'orientation': 'portrait'
    },
    PaperMargin: {
        'top': 15,
        'bottom': 15,
        'left': 12,
        'right': 12
    },
    Grid: {
        'verticalLines': 'equal',
        'horizontalLines': 'fixed',
        'verticalDivision': 24,
        'verticalInterval': 20,
        'verticalStartPoint': 'left',
        'horizontalDivision': 24,
        'horizontalInterval': 20,
        'horizontalStartPoint': 'top',
        'headerVisible': true,
        'headerPosition': 4,
        'headerHeight': 16,
        'footerVisible': true,
        'footerPosition': 4,
        'footerHeight': 16
    }
};

/** 
 *  新規帳票
 */
function newForm(id) {
    $('#paper-container').html(`
        <div id="${id}" class="cfe-form" >
            <script type="application/json" class="cfe-edit-data"></script>
            <div class="cfe-page">
                <canvas class="cfe-grid-layer"></canvas>
                <div class="cfe-parts-layer"></div>
                <div class="cfe-highlight-layer"></div>
            </div>
        </div>
    `);
    applyEditorSettings(DEFAULT_EDITOR_SETTINGS);
};

var DESABLE_SET_GRID = false;

/**
 * エディタ設定を反映させる
 * @param {Object} settings 設定情報 
 */
function applyEditorSettings(settings) {
    DESABLE_SET_GRID = true;
    TABS.forEach(tab => {
        tab.controls.forEach(control => {
            if(control.id in settings) {
                control.import(settings[control.id]);
            }
        });
    });
    DESABLE_SET_GRID = false;
    setGrid();
}

/**
 * ptをpxに変換する係数の取得
 * @returns 係数
 */  
function getPTtoPX() {
    return getMMtoPX() / 2.8346;
}

/**
 * mmをpxに変換する係数の取得
 * @returns 係数
 */  
function getMMtoPX() {
    const $page = $('.cfe-page').eq(0);
    const size = $('#paper-size').val();
    let mm = PAPER_SIZES[size].width;
    return $page.width() / mm;
}

//  グリッドの座標を格納する変数
var GRID_POINTS = {
    x: [],
    y: []
};

/**
 * グリッドの設定をする
 */
function setGrid() {
    if(DESABLE_SET_GRID) {
        return;
    }
    //  設定値の取得
    let settings = {
        PaperMargin: CntPaperMargin.export(),
        Grid: CntGridSettings.export()
    }
    let axis = getGridAxis(settings);
    drawGrid(axis);
    GRID_POINTS.x = axis.body.x.concat();
    GRID_POINTS.y = axis.body.y.concat();
    if(axis.header) {
        GRID_POINTS.y = axis.body.y.concat(axis.header.y);
    }
    if(axis.footer) {
        GRID_POINTS.y = axis.body.y.concat(axis.footer.y);
    }
};

/**
 * グリッドの座標を計算する
 * @param {Object} settings 設定 
 * @returns 座標データ
 */
function getGridAxis(settings) {
    let pt2px = getPTtoPX();    //  ptからpxへの変換係数
    let mm2px = getMMtoPX();   //  ptからpxへの変換係数
    //  分割／一定間隔
    const verticalLines = settings.Grid.verticalLines;
    const horizontalLines = settings.Grid.horizontalLines;
    //  縦線の、分割数、間隔、起点
    const verticalDivision = settings.Grid.verticalDivision;
    const verticalInterval = settings.Grid.verticalInterval * pt2px;
    const verticalStartPoint = settings.Grid.verticalStartPoint;
    //  横線の、分割数、間隔、起点
    const horizontalDivision = settings.Grid.horizontalDivision;
    const horizontalInterval = settings.Grid.horizontalInterval * pt2px;
    const horizontalStartPoint = settings.Grid.horizontalStartPoint;
    // ヘッダの描画設定
    const headerVisible = settings.Grid.headerVisible;
    const headerPosition = settings.Grid.headerPosition * mm2px;
    const headerHeight = settings.Grid.headerHeight * pt2px;
    // フッタの描画設定
    const footerVisible = settings.Grid.footerVisible;
    const footerPosition = settings.Grid.footerPosition * mm2px;
    const footerHeight = settings.Grid.footerHeight * pt2px;
    //  マージン
    const margins = {
        top: settings.PaperMargin.top * mm2px,
        bottom: settings.PaperMargin.bottom * mm2px,
        left: settings.PaperMargin.left * mm2px,
        right: settings.PaperMargin.right * mm2px,
    };
    //  戻り値の雛形
    let axis = {
        body: { x:[], y:[] },
        header: { y:[] },
        footer: { y:[] },
    }

    const $layer = $('.cfe-grid-layer').eq(0);
    const width = $layer.width();
    const height = $layer.height();

    //  線を引く領域
    const bodyArea = {
        top: margins.top,
        bottom: height - margins.bottom,
        left: margins.left,
        right: width - margins.right,
        width: width - margins.left - margins.right,
        height: height - margins.top - margins.bottom
    };
    const headerArea = {
        top: headerPosition,
        bottom: headerPosition + headerHeight,
        height: headerHeight
    };
    const footerArea = {
        top: height - footerPosition - footerHeight,
        bottom: height - footerPosition,
        height: footerHeight
    };

    //  枠線
    axis.body.x.push(bodyArea.left);
    axis.body.x.push(bodyArea.right);
    axis.body.y.push(bodyArea.top);
    axis.body.y.push(bodyArea.bottom);
    axis.header.y.push(headerArea.top);
    axis.header.y.push(headerArea.bottom);
    axis.footer.y.push(footerArea.top);
    axis.footer.y.push(footerArea.bottom);

    //  縦線
    let spacing = bodyArea.width / verticalDivision;
    let startX = bodyArea.left;
    if (verticalLines === 'fixed') {
        spacing = verticalInterval;
        if (verticalStartPoint === 'right') {
            startX += bodyArea.width % verticalInterval;
        } else if (verticalStartPoint === 'center') {
            startX += (bodyArea.width / 2) % verticalInterval;
        }
    }
    for (let x = startX; x <= bodyArea.right; x += spacing) {
        if(!axis.body.x.includes(x)) {
            axis.body.x.push(x);
        }
    }

    //  横線
    spacing = bodyArea.height / horizontalDivision;
    let startY = bodyArea.top;
    if (horizontalLines === 'fixed') {
        spacing = horizontalInterval;
        if (horizontalStartPoint === 'bottom') {
            startY += bodyArea.height % horizontalInterval;
        } else if (horizontalStartPoint === 'center') {
            startY += (bodyArea.height / 2) % horizontalInterval;
        }
    }
    for (let y = startY; y <= bodyArea.bottom; y += spacing) {
        if(!axis.body.y.includes(y)) {
            axis.body.y.push(y);
        }
    }
    if(!headerVisible) {
        axis.header = null;
    }
    if(!footerVisible) {
        axis.footer = null;
    }
    return axis;
};

/**
 * グリッドを描画する
 * @param {Object} 座標データ 
 */
function drawGrid(axis) {
    const $gridLayers = $('.cfe-grid-layer');
    $gridLayers.each(function() {
        const $layer = $(this);
        const context = $layer[0].getContext('2d', false);
        context.clearRect(0, 0, $layer.width(), $layer.height()); // 既存のグリッドをクリア
        context.lineWidth = 1;
        context.strokeStyle = 'lightgray';
        // 縦線を描く
        for(const x of axis.body.x) {
            context.beginPath();
            context.moveTo(x, axis.body.y[0]);
            context.lineTo(x, axis.body.y[1]);
            context.stroke();
            if (axis.header) {
                context.beginPath();
                context.moveTo(x, axis.header.y[0]);
                context.lineTo(x, axis.header.y[1]);
                context.stroke();
            }
            if (axis.footer) {
                context.beginPath();
                context.moveTo(x, axis.footer.y[0]);
                context.lineTo(x, axis.footer.y[1]);
                context.stroke();
            }
        }
        // 横線を描く
        for(const y of axis.body.y) {
            context.beginPath();
            context.moveTo(axis.body.x[0], y);
            context.lineTo(axis.body.x[1], y);
            context.stroke();
        }
        if (axis.header) {
            for(let i=0; i<=1; i++) {
                context.beginPath();
                context.moveTo(axis.body.x[0], axis.header.y[i]);
                context.lineTo(axis.body.x[1], axis.header.y[i]);
                context.stroke();
            }
        }
        if (axis.footer) {
            for(let i=0; i<=1; i++) {
                context.beginPath();
                context.moveTo(axis.body.x[0], axis.footer.y[i]);
                context.lineTo(axis.body.x[1], axis.footer.y[i]);
                context.stroke();
            }
        }
    });
}