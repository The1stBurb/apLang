function print(filled, max){
    console.log(`[${'#'.repeat(filled)}${' '.repeat(max - filled)}]`)
}
let thp = 15;
let max_hp = thp;
let max_bars = 10;

for(let hp = thp; hp > 0; hp--){
    print(
        Math.ceil(
            max_bars * (hp / max_hp)
        ),
        max_bars
    );
}