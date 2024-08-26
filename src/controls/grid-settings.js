
const CntGridSettings = {
    id: 'Grid',
    title: 'グリッド設定',
    content: `
        <div class="grid-settings-line">
            <label for="vertical-lines">縦線：</label>
            <div>
                <input type="radio" id="vertical-equal" name="vertical-lines" value="equal" checked>
                <label for="vertical-equal">等分</label>
                <input type="radio" id="vertical-fixed" name="vertical-lines" value="fixed">
                <label for="vertical-fixed">一定間隔</label>
            </div>
        </div>
        <div id="vertical-equal-panel" class="settings-panel">
            <label for="vertical-division">分割数：</label>
            <select id="vertical-division" name="vertical-division">
                <!-- Optionはinitializeで生成 -->
            </select>
        </div>
        <div id="vertical-fixed-panel" class="settings-panel">
            <label for="vertical-interval">間隔：</label>
            <input type="number" id="vertical-interval" name="vertical-interval" min="4" step="0.5">
            <span class="unit">pt</span>
            <label for="vertical-start-point">起点：</label>
            <select id="vertical-start-point" name="vertical-start-point">
                <option value="left">左</option>
                <option value="center">中</option>
                <option value="right">右</option>
            </select>
        </div>

        <div class="grid-settings-line">
            <label for="horizontal-lines">横線：</label>
            <div>
                <input type="radio" id="horizontal-equal" name="horizontal-lines" value="equal" checked>
                <label for="horizontal-equal">等分</label>
                <input type="radio" id="horizontal-fixed" name="horizontal-lines" value="fixed">
                <label for="horizontal-fixed">一定間隔</label>
            </div>
        </div>
        <div id="horizontal-equal-panel" class="settings-panel">
            <label for="horizontal-division">分割数：</label>
            <select id="horizontal-division" name="horizontal-division">
                <!-- Optionはinitializeで生成 -->
            </select>
        </div>
        <div id="horizontal-fixed-panel" class="settings-panel">
            <label for="horizontal-interval">間隔：</label>
            <input type="number" id="horizontal-interval" name="horizontal-interval" min="4" step="0.5">
            <span class="unit">pt</span>
            <label for="horizontal-start-point">起点：</label>
            <select id="horizontal-start-point" name="horizontal-start-point">
                <option value="top">上</option>
                <option value="center">中</option>
                <option value="bottom">下</option>
            </select>
        </div>

        <div class="cnt-header-settings">
            <label>
                <input type="checkbox" id="header-visible" checked />
                ヘッダ
            </label>
            <div class="cnt-header-panel">
                <div class="cnt-header-position">
                    <label for="header-position">上端より:</label>
                    <input type="number" id="header-position" step="1" min="0" value="20" />
                    <span class="unit">mm</span>
                </div>
                <div class="cnt-header-height">
                    <label for="header-height">高さ:</label>
                    <input type="number" id="header-height" step="1" min="0" value="10" />
                    <span class="unit">pt</span>
                </div>
            </div>
        </div>

        <div class="cnt-footer-settings">
            <label>
                <input type="checkbox" id="footer-visible" checked />
                フッタ
            </label>
            <div class="cnt-footer-panel">
                <div class="cnt-footer-position">
                    <label for="footer-position">下端より:</label>
                    <input type="number" id="footer-position" step="1" min="0" value="20" />
                    <span class="unit">mm</span>
                </div>
                <div class="cnt-footer-height">
                    <label for="footer-height">高さ:</label>
                    <input type="number" id="footer-height" step="1" min="0" value="10" />
                    <span class="unit">pt</span>
                </div>
            </div>
        </div>
    `,
    initialize: () => {
        // 分割数のoptionを生成
        const options = Array.from({ length: 108 }, (_, i) => i + 1).filter(n => {
            while (n % 2 === 0) n /= 2;
            while (n % 3 === 0) n /= 3;
            while (n % 5 === 0) n /= 5;
            return n === 1;
        }).map(n => `<option value="${n}">${n}</option>`).join('');

        $('#vertical-division, #horizontal-division').append(options);

        // ラジオボタンとパネル表示のイベントハンドラを共通化
        $('input[name="vertical-lines"], input[name="horizontal-lines"]').on('change', function() {
            const lineType = $(this).attr('name').split('-')[0];
            const value = $(this).val();
            $(`#${lineType}-equal-panel`).toggle(value === 'equal');
            $(`#${lineType}-fixed-panel`).toggle(value === 'fixed');
            CntGridSettings.apply(); // グリッド設定の適用
        });

        // 分割数、間隔、起点の変更イベント処理
        $('#vertical-division, #vertical-interval, #vertical-start-point, #horizontal-division, #horizontal-interval, #horizontal-start-point')
            .on('change', CntGridSettings.apply);

        // ヘッダ・フッタ設定のイベントハンドラ
        $('#header-visible, #header-position, #header-height, #footer-visible, #footer-position, #footer-height')
            .on('input change', CntGridSettings.apply);
    },
    export: () => {
        return {
            verticalLines: $('input[name="vertical-lines"]:checked').val(),
            horizontalLines: $('input[name="horizontal-lines"]:checked').val(),
            verticalDivision: parseInt($('#vertical-division').val()),
            verticalInterval: parseFloat($('#vertical-interval').val()),
            verticalStartPoint: $('#vertical-start-point').val(),
            horizontalDivision: parseInt($('#horizontal-division').val()),
            horizontalInterval: parseFloat($('#horizontal-interval').val()),
            horizontalStartPoint: $('#horizontal-start-point').val(),
            headerVisible: $('#header-visible').is(':checked'),
            headerPosition: parseInt($('#header-position').val()),
            headerHeight: parseFloat($('#header-height').val()),
            footerVisible: $('#footer-visible').is(':checked'),
            footerPosition: parseInt($('#footer-position').val()),
            footerHeight: parseFloat($('#footer-height').val())
        };
    },
    import: ($data) => {
        $('#vertical-division').val($data['verticalDivision']);
        $('#vertical-interval').val($data['verticalInterval']);
        $('#vertical-start-point').val($data['verticalStartPoint']);
        $('#horizontal-division').val($data['horizontalDivision']);
        $('#horizontal-interval').val($data['horizontalInterval']);
        $('#horizontal-start-point').val($data['horizontalStartPoint']);
        $('#header-visible').prop('checked', $data['headerVisible']);
        $('#header-position').val($data['headerPosition']);
        $('#header-height').val($data['headerHeight']);
        $('#footer-visible').prop('checked', $data['footerVisible']);
        $('#footer-position').val($data['footerPosition']);
        $('#footer-height').val($data['footerHeight']);
        $(`input[name="vertical-lines"][value="${$data['verticalLines']}"]`).prop('checked', true).trigger('change');
        $(`input[name="horizontal-lines"][value="${$data['horizontalLines']}"]`).prop('checked', true).trigger('change');
        // CntGridSettings.apply(); // グリッド設定の適用
    },
    apply() {
        setGrid();
    }
};

