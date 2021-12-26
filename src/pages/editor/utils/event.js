class Event {
    constructor() {
        this.events = {};
    }

    on(type, fn) {
        if (this.events[type]) {
            this.events[type].push(fn)
        } else {
            this.events[type] = [fn]
        }
    }

    emit(type, ...data) {
        if (this.events[type]) {
            this.events[type].forEach(fn => {
                fn(...data)
            });
        }
    }

    off(type) {
        if (this.events[type]) {
            delete this.events[type]
        }
    }
}

export default Event;