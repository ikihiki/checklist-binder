import { ShorthandValue, ListItemProps, List, Button, Flex, Text,Dialog } from "@fluentui/react-northstar";
import { observer } from "mobx-react";
import { useState } from "react";
import { CheckList } from "../model/checklist";
import { CheckListEdit } from "./checklistEdit";

interface IProp {
    checkList: CheckList;
}

export const ChecklistView = observer(({ checkList }: IProp) => {
    const items = checkList.CheckItems.map(item => ({
        key: item.Name,
        header: item.Name,
        headerMedia: `${item.EstimateTime?.hours}:${item.EstimateTime?.minutes}:${item.EstimateTime?.seconds}`
    } as ShorthandValue<ListItemProps>));

    const [ openEdit, setOpenEdit ] = useState(false); 

    return (
        <Flex column style={{ height: '100vh' }}>
            <Flex.Item size='auto'>
                <Flex>
                    <Flex.Item grow>
                        <Text content={checkList.Name} />
                    </Flex.Item>
                    <Flex.Item size='auto'>
                        <Dialog
                            header="Edit"
                            content={<CheckListEdit checkList={checkList} onClose={() => setOpenEdit(false)} />}
                            open={openEdit}
                            closeOnOutsideClick={false}
                            onOpen={() => setOpenEdit(true)}
                            onCancel={()=>setOpenEdit(false)}
                            trigger={<Button content='Edit' />}
                        />
                    </Flex.Item>
                </Flex>
            </Flex.Item>
            <Flex.Item grow styles={{ overflowY: 'scroll' }}>
                <div>
                    <List items={items}></List>
                </div>
            </Flex.Item>
            <Flex.Item size='auto'>
                <div >
                    <Button fluid onClick={()=>checkList.start()}>Start</Button>
                </div>
            </Flex.Item>
        </Flex>
    );
})