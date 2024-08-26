
// 用紙サイズとその幅・高さのテーブル
const PAPER_SIZES = {
    'A5': { width: 148, height: 210 },
    'B5': { width: 176, height: 250 },
    'A4': { width: 210, height: 297 },
    'B4': { width: 250, height: 353 },
    'A3': { width: 297, height: 420 }
};

/**
 * 用紙サイズ設定
 */
const CntPaperSize = {
    id: 'PaperSize',
    title: '用紙のサイズと向き',
    content: `
        <div class="cnt-paper-size-selector">
            <label for="paper-size">用紙サイズ</label>
            <select id="paper-size">
                <option value="A5">A5</option>
                <option value="B5">B5</option>
                <option value="A4" selected>A4</option>
                <option value="B4">B4</option>
                <option value="A3">A3</option>
            </select>
        </div>
        <div class="cnt-paper-orientation-selector">
            <label for="paper-orientation">用紙向き</label>
            <select id="paper-orientation">
                <option value="portrait" selected>縦置き</option>
                <option value="landscape">横置き</option>
            </select>
        </div>
    `,
    initialize: () => {
        // 用紙サイズと向きの設定
        $('#paper-size').on('change', CntPaperSize.apply);
        $('#paper-orientation').on('change', CntPaperSize.apply);
    },
    export: () => {
        return {
            'size': $('#paper-size').val(),
            'orientation': $('#paper-orientation').val()
        }
    },
    import: ($data) => {
        $('#paper-size').val($data['size']);
        $('#paper-orientation').val($data['orientation']);
        CntPaperSize.apply();
    },
    apply: () => {
        const size = $('#paper-size').val();
        const orientation = $('#paper-orientation').val();
        const $page = $('.cfe-page');
    
        // 用紙サイズを取得
        const paperSize = PAPER_SIZES[size] || PAPER_SIZES['A4']; // デフォルトはA4
    
        // 用紙サイズを適用
        $page.css({
            width: `${paperSize.width}mm`,
            height: `${paperSize.height}mm`
        });
    
        // 用紙の向きを適用
        if (orientation === 'landscape') {
            $page.css({
                width: `${paperSize.height}mm`,
                height: `${paperSize.width}mm`
            });
        }
    
        //  canvasのサイズを指定
        let width = $page.width();
        let height = $page.height();
        $('.cfe-grid-layer').each(function() {
            $(this).attr('width', width).attr('height', height);
        });
        //  グリッドの再設定
        setGrid();
    }
}

/**
 * マージン設定
 */
const CntPaperMargin = {
    id: 'PaperMargin',
    title: '余白',
    content: `
        <div class="cnt-margin-grid">
            <div class="cnt-margin-item">
                <label for="margin-top">上:</label>
                <input type="number" id="margin-top" step="1" max="50" min="0" value="10" />
                <span class="unit">mm</span>
            </div>
            <div class="cnt-margin-link-button" id="link-top-bottom">
                <span class="material-icons">link</span>
            </div>
            <div class="cnt-margin-item">
                <label for="margin-bottom">下:</label>
                <input type="number" id="margin-bottom" step="1" max="50" min="0" value="10" />
                <span class="unit">mm</span>
            </div>
            <div class="cnt-margin-item">
                <label for="margin-left">左:</label>
                <input type="number" id="margin-left" step="1" max="50" min="0" value="10" />
                <span class="unit">mm</span>
            </div>
            <div class="cnt-margin-link-button" id="link-left-right">
                <span class="material-icons">link</span>
            </div>
            <div class="cnt-margin-item">
                <label for="margin-right">右:</label>
                <input type="number" id="margin-right" step="1" max="50" min="0" value="10" />
                <span class="unit">mm</span>
            </div>
        </div>
    `,
    initialize: () => {
        // 上下リンクボタンの処理
        let topBottomLinked = true;
        $('#link-top-bottom').on('click', function() {
            topBottomLinked = !topBottomLinked;
            $(this).find('.material-icons').text(topBottomLinked ? 'link' : 'link_off');

            if (topBottomLinked) {
                $('#margin-bottom').val($('#margin-top').val());
            }
            CntPaperMargin.apply();
        });

        $('#margin-top').on('input', () => {
            if (topBottomLinked) {
                $('#margin-bottom').val($('#margin-top').val());
            }
            CntPaperMargin.apply();
        });
        $('#margin-bottom').on('input', () => {
            if (topBottomLinked) {
                $('#margin-top').val($('#margin-bottom').val());
            }
            CntPaperMargin.apply();
        });

        // 左右リンクボタンの処理
        let leftRightLinked = true;
        $('#link-left-right').on('click', function() {
            leftRightLinked = !leftRightLinked;
            $(this).find('.material-icons').text(leftRightLinked ? 'link' : 'link_off');

            if (leftRightLinked) {
                $('#margin-right').val($('#margin-left').val());
            }
            CntPaperMargin.apply();
        });

        $('#margin-left').on('input', () => {
            if (leftRightLinked) {
                $('#margin-right').val($('#margin-left').val());
            }
            CntPaperMargin.apply();
        });
        $('#margin-right').on('input', () => {
            if (leftRightLinked) {
                $('#margin-left').val($('#margin-right').val());
            }
            CntPaperMargin.apply();
        });
    },
    export: () => {
        return {
            'top': parseInt($('#margin-top').val()),
            'bottom': parseInt($('#margin-bottom').val()),
            'left': parseInt($('#margin-left').val()),
            'right': parseInt($('#margin-right').val())
        }
    },
    import: ($data) => {
        $('#margin-top').val($data['top']);
        $('#margin-bottom').val($data['bottom']);
        $('#margin-left').val($data['left']);
        $('#margin-right').val($data['right']);
        CntPaperMargin.apply();
    },
    apply: ()=> {
        //  グリッドの再設定
        setGrid();
    }
};
