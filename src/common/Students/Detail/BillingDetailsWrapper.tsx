import { useLocation, useParams } from "react-router-dom";
import BillingDetails from "./BillingDetails";

const BillingDetailsWrapper = () => {
    const { month } = useParams();
    const location = useLocation();
    const isEditMode = location.pathname.endsWith("/edit");
    const billing = location.state?.billing;
    const formData = location.state?.formData;
    const customer = location.state?.customer

    console.log('month', month)
    console.log('formData', formData)
    console.log('billing', billing)

    if (!billing || !formData || !month) {
        // URL直打ち対策：ここで Firestore 再取得ロジックを入れる
        return <div>Loading...</div>;
    }

    return <BillingDetails
        billing={billing}
        formData={formData}
        month={month}
        customer={customer}
        isEditMode={isEditMode}
    />;
};

export default BillingDetailsWrapper;
