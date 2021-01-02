import { observer } from "mobx-react";
import { CheckList } from "../model/checklist";
import { CheckListRunning } from "./checklistRunning";
import { ChecklistView } from "./checklistView";

interface IProps {
    checkList?: CheckList;
}


export const CheckListDetail = observer(({ checkList }: IProps) => {
    if (checkList) {
            if (checkList.IsRunning) {
        return (
            <CheckListRunning checkList={checkList} />
        )
    }
    return (
        <ChecklistView checkList={checkList} />
    )

    } else {
        return (
            <div>not selected</div>
        )
    }
});