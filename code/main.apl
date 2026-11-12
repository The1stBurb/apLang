let self = {
    name: 'You',

    max_hp: 100,
    hp: 100,
    
    atk: 1,
    blk: 0,

    xp: 0,

    wpn:{
        name:'',
        atk:0,
        blk:0,
    },
};
let hp_bar_steps = 10;


func printHP(hp, max_hp){
    let steps = Math.ceil(hp_bar_steps * hp / max_hp);
    print(' HP: [' + ( '#' * steps ) + ( ' ' * ( hp_bar_steps - steps) ) + '] ( ' + hp + '/' + max_hp + ' )')
}

func printStats(guy){
    print(guy.name + ':')
    printHP(guy.hp, guy.max_hp)
    print(' ATK: ' + guy.atk, '| BLK: ' + guy.blk)
    if(guy.wpn.name != ''){
        print('Weapon: ' + guy.wpn.name)
        print(' ATK: ' + guy.wpn.atk, '| BLK: ' + guy.wpn.blk)
    }
    print()
}

let enem;

const weaponNames = ['stick', 'staff', 'blade', 'club'];

func createWeapon(){
    ret {
        name: Rand.choice(weaponNames),
        atk: Rand.randint(0,5),
        blk: Rand.randint(0,2),
    };
}

func createEnem(){
    enem = {
        name: 'Enemy',

        max_hp: Rand.randint(10,20),
        hp: -1,

        atk: 1,
        blk: 0,
        
        wpn: createWeapon(),
    }
    enem.hp = enem.max_hp
}

func calcATK(guy) -> guy.atk + enem.wpn.atk;

func round(){
    printStats(self)
    printStats(enem)
    let inp = input('What do you do?');
    if(inp == 'atk'){
        let dmg = calcATK(self);
        print('You do', dmg, 'damage!')
        enem.hp -= dmg
    }

    let dmg = calcATK(enem);
    print('You took', dmg, 'damage!')
    self.hp -= dmg

    if(enem.hp < 0){
        let xp = Rand.randint(5, 100);
        print('Congrats! You killed', enem.name, 'and earned',xp,'XP!')
        self.xp += xp

        createEnem()
    }
    input('Press enter to continue.')
    print('\n' * 10)
}

createEnem()
while(true){
    round()
}