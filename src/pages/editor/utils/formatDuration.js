export default function formatDuration(time) {
    let timeFormatted,
        timeSF = 0,
        timeMF = 0,
        timeHF = 0;
    time = parseInt(time / 1000);
    let timeS = time % 60;
    let timeM = Math.floor(time / 60) % 60;
    let timeH = Math.floor(time / 60 / 60);

    timeS < 10 ? (timeSF = '0' + timeS) : (timeSF = '' + timeS);
    timeM < 10 ? (timeMF = '0' + timeM) : (timeMF = '' + timeM);
    timeH < 10 ? (timeHF = '0' + timeH) : (timeHF = '' + timeH);

    timeFormatted = timeHF + ':' + timeMF + ':' + timeSF;

    return timeFormatted;
}