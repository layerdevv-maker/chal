'use strict';
const Database = require('better-sqlite3');
const path = require('path');

let db = null;

const TABLE_MAP = {
  stores:         'stores',
  purchases:      'purchases',
  deliveries:     'deliveries',
  payments:       'payments',
  returns:        'returns',
  bottleBatches:  'bottle_batches',
  salaryPayments: 'salary_payments',
  settings:          'settings',
  expenses:          'expenses',
  expenseCategories: 'expense_categories'
};

const COLS = {
  stores:         ['id','name','contact','phone','addr','createdAt'],
  purchases:      ['id','date','qty','cost','supplier'],
  deliveries:     ['id','storeId','date','qty','price','paidNow','payType'],
  payments:       ['id','storeId','date','amount','note'],
  returns:        ['id','storeId','date','qty','price','reason'],
  bottleBatches:  ['id','date','qty','bottlePrice','labelPrice','supplier','note'],
  salaryPayments: ['id','date','base','bonus','note'],
  settings:          ['key','value'],
  expenses:          ['id','date','amount','categoryId','note','sourceId'],
  expenseCategories: ['id','name','color','isSystem']
};

const SEED_STORES = [
  'Balkanabat','Galan Cal','Gunlik çykdaýjy','Tölegsiz berlen',
  '11 mkr içi','11 mkr Muhammet','15 tapgyr elitka','30 naçnoý',
  'Abyraýly kafe','Ak şäherim gagarin','Ak tam Uspen','Altyn market',
  'Amatly market mir elitka','Arzuw magazyn','Asuda Abadan',
  'Atabaýew hökmet magazyn','Atabaýew magazyn 52 Baba','Aýşanur market',
  'Bamaka 97 magazyn','Bamaka kwas Toýly','Bamaka moýka magazyn Arslan',
  'Domino market Dowlet','Elitka Ýubileýni','Et magazyn Arslan',
  'Gagarin magazyn Öwez','Gämi market 11 mkr Ýusup','Gämi Uspen',
  'Gawdan 42 mek.','Geldimyrat','Gogal','Grazdan','Güneş market',
  'Haýrat market','Hazyna bazar','Hezzet market','Hitrofka magazyn',
  'Hitrofka Meret','Hödür Kemal','hökmet magazyn','Hyzmat market',
  'Isa','Jygyllyk','Katowsky most Merdan','Kemine pekarny Nazar',
  'Kisa market','klent','Lälezar döner','Mir 4 podwal','Mir 7 2',
  'Mir 7 mini market','Mop market','Oguz market Dawut','Optom haladilnik',
  'Pekarny Öwez','Pelle kafe','Podwoýski','Podwoýski Şöhle magazyn',
  'Salhoz magazyn','Şamuhammet','Şazada market','Şeker market','Şirin Aý',
  'Şor garadamak Alty market','Sowgat magazyn Süleýman','Sumbar magazyn 97',
  'Swistopel','Swistopel döner','Täjir market petirzawodski','Uspen',
  'Ýyldyz market Ýubileýni','Bamaka döner','Täze zaman Majamer',
  'Täze zaman Reýhan','Gurtly mag','Halturun','Kenar somsa',
  'Hitrowka suleýman','Tajir optowoý','Altyn ýubileýni','Et magazyn ýerewan',
  'Owadandepe Eziz','Ýunus market','Garadamak market','10 mkr optom',
  'Unwermag doner','Halturn','Gokdepe yzgant','Köşi magazyn','Aşgabat mol',
  'Bekrewe','Çopan market','Mir 7 Begenç','Damja','Himýa market',
  'Doniskoý','Mir 4 42 dom','Mir 4 stoýanka','Mir 6 82 dom',
  'Mir 6 dom 97','Mir 6 dom 89','Köşi pekarny','Bagyr optom','Hyzmat öýi',
  'Nur market','Ýakymly market','Çoganly zaparozny','Optowoý 89 mag',
  'Taze zaman Hyzmat öýi','Änew','Kömek market','Gökje Sapa','Gökje miraş',
  'Waka','Täç market','Bagtyýarlyk','Gowdan nacnoy','Şeker eller',
  'Ýerewan naçnoý','Nour','Ýubileyni noç','Teke Bazar',
  'Hitrowka ors mekdep','Turist Toýly','Obiznoý mini market','Grant garden',
  'Aýdyn mekan','Atabaýew izmir ýandaky','Garadok','Anew döner',
  'Rysgally','Arzuw aý','Täjir obiznoý','30 döner','Täjir derjinski',
  'Aýşa market','Palawa gel','Gülşat kafe','Aýdyn mekan Kerwen kafe',
  'Aýdyn mekan Tkm tagam kafe','Aýdyn mekan magazyn',
  'Aýdyn mekan inco arkasy mag.','Lahuty 42 magazyn','Mir 1 hokmet magazyn',
  'Ak ýol bazar stoýanka','Lahuty mag','Magtymguly unwer. Ortaky mag',
  '11 mkr Dowletli mag','Bamaka tamdyr somsa','Aýtakow pekarny',
  'Köşi şaşlyk','Şa Abbas','Çoganly gayyn arka tarapy','Muhammet'
];

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function seedStores() {
  const count = db.prepare('SELECT COUNT(*) as c FROM stores').get().c;
  if (count > 0) return;
  const today = new Date().toISOString().slice(0, 10);
  const stmt = db.prepare(
    'INSERT INTO stores (id,name,contact,phone,addr,createdAt) VALUES (?,?,?,?,?,?)'
  );
  const insertMany = db.transaction(() => {
    for (const name of SEED_STORES) {
      stmt.run(genId(), name, '', '', '', today);
    }
  });
  insertMany();
}

function init(userDataPath) {
  const dbPath = path.join(userDataPath, 'kaswa_jebel_caly.db');
  db = new Database(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY, name TEXT NOT NULL,
      contact TEXT, phone TEXT, addr TEXT, createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY, date TEXT, qty REAL, cost REAL, supplier TEXT
    );
    CREATE TABLE IF NOT EXISTS deliveries (
      id TEXT PRIMARY KEY, storeId TEXT, date TEXT,
      qty REAL, price REAL, paidNow REAL, payType TEXT
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY, storeId TEXT, date TEXT, amount REAL, note TEXT
    );
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY, storeId TEXT, date TEXT,
      qty REAL, price REAL, reason TEXT
    );
    CREATE TABLE IF NOT EXISTS bottle_batches (
      id TEXT PRIMARY KEY, date TEXT, qty REAL,
      bottlePrice REAL, labelPrice REAL, supplier TEXT, note TEXT
    );
    CREATE TABLE IF NOT EXISTS salary_payments (
      id TEXT PRIMARY KEY, date TEXT, base REAL, bonus REAL, note TEXT
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY, value TEXT
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY, date TEXT, amount REAL,
      categoryId TEXT, note TEXT, sourceId TEXT
    );
    CREATE TABLE IF NOT EXISTS expense_categories (
      id TEXT PRIMARY KEY, name TEXT, color TEXT, isSystem INTEGER DEFAULT 0
    );
  `);
  seedStores();
  seedSettings();
  seedExpenseCategories();
}

function seedExpenseCategories() {
  const count = db.prepare('SELECT COUNT(*) as c FROM expense_categories').get().c;
  if (count > 0) return;
  const cats = [
    { id: 'cat_chal', name: 'Çal',      color: '#2c5282', isSystem: 1 },
    { id: 'cat_btl',  name: 'Baklažka', color: '#0f766e', isSystem: 1 },
    { id: 'cat_sal',  name: 'Aýlyk',    color: '#5b3fa0', isSystem: 1 },
    { id: 'cat_car',  name: 'Awtoulag', color: '#c2600a', isSystem: 1 },
    { id: 'cat_oth',  name: 'Beýleki',  color: '#6b7280', isSystem: 1 }
  ];
  const stmt = db.prepare('INSERT INTO expense_categories (id,name,color,isSystem) VALUES (?,?,?,?)');
  const ins = db.transaction(() => { for (const c of cats) stmt.run(c.id, c.name, c.color, c.isSystem); });
  ins();
}

function seedSettings() {
  const defaults = { default_chal_cost: '9', default_bottle_cost: '2', salary_base: '5000' };
  const stmt = db.prepare('INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)');
  for (const [k, v] of Object.entries(defaults)) stmt.run(k, v);
}

function getAll(table) {
  const t = TABLE_MAP[table];
  if (!t) throw new Error(`Unknown table: ${table}`);
  return db.prepare(`SELECT * FROM ${t}`).all();
}

function insert(table, data) {
  const t = TABLE_MAP[table];
  if (!t) throw new Error(`Unknown table: ${table}`);
  const cols = COLS[table];
  const vals = cols.map(c => data[c] !== undefined ? data[c] : null);
  db.prepare(
    `INSERT OR REPLACE INTO ${t} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`
  ).run(...vals);
  return { success: true };
}

function deleteRecord(table, id) {
  const t = TABLE_MAP[table];
  if (!t) throw new Error(`Unknown table: ${table}`);
  db.prepare(`DELETE FROM ${t} WHERE id = ?`).run(id);
  return { success: true };
}

function loadAll() {
  return {
    stores:         getAll('stores'),
    purchases:      getAll('purchases'),
    deliveries:     getAll('deliveries'),
    payments:       getAll('payments'),
    returns:        getAll('returns'),
    bottleBatches:  getAll('bottleBatches'),
    salaryPayments:    getAll('salaryPayments'),
    settings:          getAll('settings'),
    expenses:          getAll('expenses'),
    expenseCategories: getAll('expenseCategories')
  };
}

module.exports = { init, getAll, insert, deleteRecord, loadAll };
