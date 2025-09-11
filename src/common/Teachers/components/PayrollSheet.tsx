import React from 'react';

// コンポーネントの型を React.FC (Functional Component) として定義します
const PayrollSheet: React.FC = () => {
    // return() の中で、画面に表示したいHTMLのような要素を返します
    return (
        <div>
            <h1>給与計算シート</h1>
            <p>ここに給与計算の機能を作成します。</p>
        </div>
    );
};

// 他ファイルでこのコンポーネントを読み込めるように exportします
export default PayrollSheet;
