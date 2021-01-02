import { CheckListCollection } from "../model/checklist";
import { observer } from "mobx-react"
import { List, ListItemProps, ShorthandValue, Flex, Button, AddIcon, CloseIcon, PlayIcon } from "@fluentui/react-northstar";
import { useHistory } from "react-router";

interface IProps {
    collection: CheckListCollection;
    selected?: string
    userName: string
}


export const CheckListMasterView = observer(({ collection, selected, userName }: IProps) => {
    const history = useHistory();
    const items = collection.CheckLists.map(checkList => ({
        key: checkList.Id,
        header: <div><PlayIcon style={{ visibility: checkList.IsRunning ? undefined : 'hidden' }} /> {checkList.Name}</div>,
        endMedia: (checkList.IsRunning ?
            <div />
            : <Button icon={<CloseIcon />} iconOnly onClick={() => collection.deleteCheckList(checkList.Id)}></Button>),
        onClick: () => history.push(`/${checkList.Id}`)
    } as ShorthandValue<ListItemProps>));
    const selectedItem = collection.CheckLists.findIndex(checkList => checkList.Id === selected);

    return (
        <Flex column>
            <Flex.Item size='autp'>
                <div>
                    <Flex>
                        <Flex.Item grow>
                            <div>Checklist: { userName}</div>
                        </Flex.Item>
                        <Flex.Item size='auto'>
                            <Button onClick={() => collection.addCheckList()}>
                                <AddIcon />
                            </Button>
                        </Flex.Item>
                    </Flex>
                </div>
            </Flex.Item>
            <Flex.Item grow>
                <div style={{ overflowY: 'scroll' }}>
                    <List selectable items={items} selectedIndex={selectedItem} />
                </div>
            </Flex.Item>

        </Flex>

    );
});