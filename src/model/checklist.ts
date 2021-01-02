import firebase from "firebase";
import { Duration, DateTime } from "luxon";
import { action, computed, makeAutoObservable, makeObservable, observable } from "mobx";

export class CheckItem {
    Name: string = "";
    EstimateTime: Duration = Duration.fromObject({ hour: 0, minute: 0, second: 0 });
    StartDate: DateTime | null = null;
    EndDate: DateTime | null = null;



    constructor(name: string, estimateTime: Duration, startDate: DateTime | null = null, endDate: DateTime | null = null
    ) {
        makeObservable(this, {
            Name: observable,
            EstimateTime: observable,
            StartDate: observable,
            EndDate: observable,
            IsRunning: computed,
            IsCompleted: computed,
            start: action,
            complete: action,
            reset: action
        });
        this.Name = name;
        this.EstimateTime = estimateTime;
        this.StartDate = startDate;
        this.EndDate = endDate;
    }

    get IsRunning() {
        return this.StartDate != null && this.EndDate == null;
    }

    get IsCompleted() {
        return this.StartDate != null && this.EndDate != null;
    }

    start() {
        this.StartDate = DateTime.utc();
    }
    complete() {
        this.EndDate = DateTime.utc();
    }
    reset() {
        this.StartDate = null;
        this.EndDate = null;
    }

    get reminingTime() {
        if (this.StartDate != null && this.EndDate != null) {
            return this.EstimateTime?.minus(this.EndDate.diff(this.StartDate)).normalize().normalize();
        }
        else if (this.StartDate != null) {
            const diff = DateTime.utc().diff(this.StartDate);
            const rem = this.EstimateTime.minus(diff).normalize().normalize();
            return rem;
        } else {
            return this.EstimateTime;
        }
    }
}

export class CheckList {
    Id: string = "";
    Name: string = "";
    CheckItems: CheckItem[] = [];
    IsRunning: boolean = false;
    repo: DatabaseRepository
    constructor(id: string, name: string, checkItems: CheckItem[], isRunning = false, repo: DatabaseRepository) {
        makeAutoObservable(this);
        this.Id = id;
        this.Name = name;
        this.CheckItems = checkItems;
        this.IsRunning = isRunning;
        this.repo = repo;
    }

    update(name: string, checkItems: CheckItem[]) {
        this.repo.update(this.Id, { Name: name, CheckItems: this.CheckItems.map(ConvertToCheckItemDto) });
    }

    abort() {
        for (const item of this.CheckItems) {
            item.reset();
        }
        this.repo.update(this.Id, { IsRunning: false, CheckItems: this.CheckItems.map(ConvertToCheckItemDto) });
    }
    start() {
        this.repo.update(this.Id, { IsRunning: true });
    }
    next() {
        if (!this.IsRunning) {
            return;
        }
        const runningIndex = this.CheckItems.findIndex(checkItem => checkItem.IsRunning);
        if (runningIndex > -1) {
            this.CheckItems[runningIndex].complete();
            if (runningIndex < this.CheckItems.length - 1) {
                this.CheckItems[runningIndex + 1].start();
            }
        } else if (this.CheckItems.length > 0) {
            this.CheckItems[0].start();
        } else {
            return;
        }
        this.repo.update(this.Id, { CheckItems: this.CheckItems.map(ConvertToCheckItemDto) });
    }
}

export class CheckListCollection {
    CheckLists: CheckList[] = [];
    UserId: string
    CheckListref: firebase.database.Reference;
    repo: DatabaseRepository
    constructor(userId: string) {
        this.UserId = userId;
        this.CheckListref = firebase.database().ref(`/users/${this.UserId}/check-lists`);
        this.repo = new DatabaseRepository(userId);
        makeAutoObservable(this);


    }

    deleteCheckList(id: string) {
        if (this.CheckLists.find(checkList => checkList.Id === id)) {
            this.CheckListref.child(id).remove();
        }
    }

    addCheckList() {
        const newCheckListRef = this.CheckListref.push();
        newCheckListRef.set(
            {
                Id: newCheckListRef.key!,
                Name: 'New CheckList',
                IsRunning: false,
                CheckItems: [
                    {
                        Name: 'Item1',
                        EstimateTime: { hours: 0, minutes: 0, seconds: 0 }
                    }
                ]
            } as CheckListDto
        );
    }

    load() {

        this.CheckListref.on('child_added', (data) => {
            const existIndex = this.CheckLists.findIndex(checkList => checkList.Id === data.key);
            if (existIndex > -1) {
                this.CheckLists[existIndex] = ConvertToCheckList(data.val() as CheckListDto, this.repo);
            } else {
                this.CheckLists = [...this.CheckLists, ConvertToCheckList(data.val() as CheckListDto, this.repo)];
            }

        });

        this.CheckListref.on('child_changed', (data) => {
            const dto = data.val() as CheckListDto;
            const checkList = this.CheckLists.find(checkList => checkList.Id === dto.Id);
            if (checkList) {
                checkList.IsRunning = dto.IsRunning;
                checkList.Name = dto.Name;
                checkList.CheckItems = dto.CheckItems.map(ConvertToCheckItem)
            }
        });

        this.CheckListref.on('child_removed', (data) => {
            this.CheckLists = this.CheckLists.filter(checkList => checkList.Id !== data.key);
        });
    }


}

interface CheckItemDto {
    Name: string;
    EstimateTime: { hours: number, minutes: number, seconds: number };
    StartDate?: string | null;
    EndDate?: string | null;
}

interface CheckListDto {
    Id: string;
    Name: string;
    CheckItems: CheckItemDto[];
    IsRunning: boolean;

}

function ConvertToCheckList(data: CheckListDto, repo: DatabaseRepository) {
    return new CheckList(
        data.Id,
        data.Name,
        data.CheckItems.map(ConvertToCheckItem),
        data.IsRunning,
        repo
    );
}

function ConvertToCheckItem(item: CheckItemDto) {
    return new CheckItem(
        item.Name,
        Duration.fromObject(item.EstimateTime),
        item.StartDate ? DateTime.fromISO(item.StartDate) : null,
        item.EndDate ? DateTime.fromISO(item.EndDate) : null,
    )
}

function ConvertToCheckItemDto(item: CheckItem) {
    return {
        Name: item.Name,
        EstimateTime: {
            hours: item.EstimateTime.hours,
            minutes: item.EstimateTime.minutes,
            seconds: item.EstimateTime.seconds
        },
        StartDate: item.StartDate ? item.StartDate.toISO() : null,
        EndDate: item.EndDate ? item.EndDate.toISO() : null,

    } as CheckItemDto;
}
class DatabaseRepository {
    private userId: string;
    private checkListsRef: firebase.database.Reference;

    //OnAddCheckList: (checkList: CheckList) => void();

    constructor(userId: string) {
        this.userId = userId
        this.checkListsRef = firebase.database().ref(`/users/${this.userId}/check-lists`);
    }

    update(id: string, data: Partial<CheckListDto>) {
        this.checkListsRef.child(id).update(data);
    }
}
