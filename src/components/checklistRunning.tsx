import { ShorthandValue, ListItemProps, List, Flex, WindowMinimizeIcon, AcceptIcon, PlayIcon, Button } from "@fluentui/react-northstar";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { CheckItem, CheckList } from "../model/checklist";
import { toTimeInputStirng } from "../model/util";


interface IPropCheckItemStatus {
    checkItem: CheckItem;
}


const CheckItemStatus = observer(({ checkItem }: IPropCheckItemStatus) => {
    if (checkItem.IsCompleted) {
        return (<AcceptIcon />);
    } else if (checkItem.IsRunning) {
        return (<PlayIcon />);
    } else {
        return (<WindowMinimizeIcon />);
    }
});

interface IPropCheckListRunning {
    checkList: CheckList;
}
export const CheckListRunning = observer(({ checkList }: IPropCheckListRunning) => {
    const items = checkList.CheckItems.map((checkItem, index) => {
        const time = `${toTimeInputStirng(checkItem.reminingTime)} / ${toTimeInputStirng(checkItem.EstimateTime)}`;
        return({
            key: index,
            header: <span><CheckItemStatus checkItem={checkItem} /> {checkItem.Name}</span>,
            headerMedia: time,
        } as ShorthandValue<ListItemProps>)
    });

    const onClickNext = () => {
        checkList.next();
    }
    const [, setDummy] = useState(Date.now());
    useEffect(() => {
        const timeoutId = setTimeout(() => setDummy(Date.now()),200);
        return () => {
            clearTimeout(timeoutId);
        };
    })

    return (
        <Flex column styles={{ height: '100vh' }}>
            <Flex.Item size='auto'>
                <Flex>
                    <Flex.Item grow>
                        <div>{checkList.Name}</div>
                    </Flex.Item>
                    <Flex.Item size='auto'>
                        <Button onClick={()=>checkList.abort()}>Abort</Button>
                    </Flex.Item>
                </Flex>

            </Flex.Item>
            <Flex.Item grow styles={{ overflowY: 'scroll' }}>
                <div>
                    <List items={items}></List>
                </div>
            </Flex.Item>
            <Flex.Item size='auto'>
                <Button fluid onClick={onClickNext}>Next</Button>
            </Flex.Item>
        </Flex>
    )

});