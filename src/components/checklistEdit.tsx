import { observer } from "mobx-react";
import { CheckItem, CheckList } from "../model/checklist";
import { ShorthandValue, ListItemProps, List, Flex, Input, Button, CloseIcon } from "@fluentui/react-northstar";
import { useDrag, DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useMemo, useState } from "react";
import { Duration } from "luxon";
import { toDuration, toTimeInputStirng } from "../model/util";

interface IPropCheckItemEdit {
    checkItem: CheckItem;
    index: number;
}
export const ItemTypes = {
    KNIGHT: 'knight'
}

interface IDragData {
    type: string;
    index: number
}



const CheckItemEdit = observer(({ checkItem, index }: IPropCheckItemEdit) => {
    const [{ isDragging }, drag] = useDrag({
        item: { type: ItemTypes.KNIGHT, index: index } as IDragData,
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        }),
    })

    return (
        <div ref={drag}>
            <Flex gap="gap.small">
                <Input fluid label='Content' value={checkItem.Name} onChange={(evt, value) => checkItem.Name = ((value?.value) || "")} />
                <Input type='time' step='1' label='EstimateTime'
                    value={toTimeInputStirng(checkItem.EstimateTime)}
                    onChange={(evt, value) => checkItem.EstimateTime = toDuration(value?.value)}
                />
            </Flex>
        </div>
    )
});
interface IPropCheckItemEditHolder {
    children: React.ReactNode;
    index: number;
    hoverItem: (from: number, to: number) => void,
    dropItem: (from: number, to: number) => void,
}
const CheckItemEditHolder = observer(({ children, index, hoverItem, dropItem }: IPropCheckItemEditHolder) => {
    const [{ isOver }, drop] = useDrop<IDragData, void, {
        isOver: boolean;
    }>({
        accept: ItemTypes.KNIGHT,
        drop: (item, monitor) => dropItem(item.index, index),
        hover: (item, monitor) => hoverItem(item.index, index),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    })
    return (<div ref={drop} style={{ background: isOver ? 'yellow' : undefined }}>
        {children}
    </div>)
});

function moveAtCopy<T>(array: T[], index: number, at: number) {
    if (index === at || index > array.length - 1 || at > array.length - 1) {
        return array;
    }
    const copy = Array.from(array);
    const value = copy[index];
    const tail = copy.slice(index + 1);

    copy.splice(index);

    Array.prototype.push.apply(copy, tail);

    copy.splice(at, 0, value);

    return copy;
}

interface IPropCheckListEdit {
    checkList: CheckList;
    onClose: () => void;
}
export const CheckListEdit = observer(({ checkList, onClose }: IPropCheckListEdit) => {
    const [name, setName] = useState(checkList.Name);
    const [move, setMove] = useState({ from: -1, to: -1 });
    const [checkItems, setCheckItems] = useState(checkList.CheckItems.map(item => new CheckItem(item.Name, item.EstimateTime)));
    const previewCheckItems = useMemo(() => {
        return moveAtCopy(checkItems, move.from, move.to)
    }, [move, checkItems])

    const items = previewCheckItems.map((checkItem, index) => ({
        key: index,
        endMedia: <Button icon={<CloseIcon />} iconOnly onClick={() => setCheckItems(checkItems.filter(item => item !== checkItem))}></Button>,
        content: <CheckItemEditHolder
            hoverItem={(from, to) => {
                if (move.from !== from || move.to !== to) {
                    setMove({ from, to });
                }
            }}
            dropItem={(from, to) => {
                setCheckItems(moveAtCopy(checkItems, from, to));
                setMove({ from: -1, to: -1 })
            }}
            index={index}>
            <CheckItemEdit checkItem={checkItem} index={index} />
        </CheckItemEditHolder>
    } as ShorthandValue<ListItemProps>));

    return (
        <Flex column gap="gap.small" style={{ maxHeight: '70vh' }}>
            <Flex.Item size='auto'>
                <div><Input fluid label='Name' value={name} onChange={(evt, value) => setName((value?.value) || "")}></Input></div>

            </Flex.Item>
            <Flex.Item grow>
                <div style={{ overflowY: 'scroll' }}>
                    <DndProvider backend={HTML5Backend}>
                        <List items={items} />
                    </DndProvider>
                </div>
            </Flex.Item>
            <Flex.Item size='auto'>
                <Button fluid onClick={() => setCheckItems([...checkItems, new CheckItem('NewItem', Duration.fromMillis(0))])}>Add</Button>
            </Flex.Item>
            <Flex.Item size='auto'>
                <Flex space='between'>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={() => {
                        checkList.update(name, checkItems);
                        onClose();
                    }}>Conferm</Button>
                </Flex>
            </Flex.Item>
        </Flex>
    )
})


