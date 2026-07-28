/**
 * DISC Assessment Tools - Apps Script backend
 * Diadaptasi dari file "DISC Master System.xlsx".
 *
 * Cara pakai singkat (lihat README.md untuk detail lengkap):
 * 1. Buat Google Sheet baru -> Extensions > Apps Script.
 * 2. Tempel isi file ini sebagai Code.gs, dan Index.html sebagai file HTML terpisah.
 * 3. Jalankan setupAdminPassword() sekali dari editor untuk set password admin,
 *    atau buka Project Settings > Script Properties dan tambahkan ADMIN_PASSWORD.
 * 4. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 5. Buka URL Web App -> peserta bisa langsung mengisi tes.
 */

// ============================================================
// KONFIGURASI
// ============================================================

const SHEET_NAME = 'Responses';
const ADMIN_TOKEN_TTL_SECONDS = 6 * 60 * 60; // 6 jam
const DEFAULT_ADMIN_PASSWORD = 'admin123'; // ganti lewat Script Properties: ADMIN_PASSWORD

const SHEET_HEADERS = [
  'Timestamp', 'ResponseId', 'Nama', 'Email', 'Usia', 'JenisKelamin', 'Jabatan',
  'Most_D', 'Most_I', 'Most_S', 'Most_C',
  'Least_D', 'Least_I', 'Least_S', 'Least_C',
  'Result_D', 'Result_I', 'Result_S', 'Result_C',
  'KodeTipe', 'NamaTipe', 'EmailTerkirim'
];

// ============================================================
// DATA SOAL & TABEL TIPE (di-generate dari DISC Master System.xlsx)
// ============================================================

const QUESTIONS = [{"no": 1, "statements": [{"text": "Gampangan, Mudah setuju", "most": "S", "least": "S"}, {"text": "Percaya, Mudah percaya pada orang", "most": "I", "least": "I"}, {"text": "Petualang, Mengambil resiko", "most": "*", "least": "D"}, {"text": "Toleran, Menghormati", "most": "C", "least": "C"}]}, {"no": 2, "statements": [{"text": "Lembut suara, Pendiam", "most": "C", "least": "*"}, {"text": "Optimistik, Visioner", "most": "D", "least": "D"}, {"text": "Pusat Perhatian, Suka gaul", "most": "*", "least": "I"}, {"text": "Pendamai, Membawa Harmoni", "most": "S", "least": "S"}]}, {"no": 3, "statements": [{"text": "Menyemangati orang", "most": "I", "least": "I"}, {"text": "Berusaha sempurna", "most": "*", "least": "C"}, {"text": "Bagian dari kelompok", "most": "*", "least": "S"}, {"text": "Ingin membuat tujuan", "most": "D", "least": "*"}]}, {"no": 4, "statements": [{"text": "Menjadi frustrasi", "most": "C", "least": "C"}, {"text": "Menyimpan perasaan saya", "most": "S", "least": "S"}, {"text": "Menceritakan sisi saya", "most": "*", "least": "I"}, {"text": "Siap beroposisi", "most": "D", "least": "D"}]}, {"no": 5, "statements": [{"text": "Hidup, Suka bicara", "most": "I", "least": "*"}, {"text": "Gerak cepat, Tekun", "most": "D", "least": "D"}, {"text": "Usaha menjaga keseimbangan", "most": "S", "least": "S"}, {"text": "Usaha mengikuti aturan", "most": "*", "least": "C"}]}, {"no": 6, "statements": [{"text": "Kelola waktu secara efisien", "most": "C", "least": "*"}, {"text": "Sering terburu-buru, Merasa tertekan", "most": "D", "least": "D"}, {"text": "Masalah sosial itu penting", "most": "I", "least": "I"}, {"text": "Suka selesaikan apa yang saya mulai", "most": "S", "least": "S"}]}, {"no": 7, "statements": [{"text": "Tolak perubahan mendadak", "most": "S", "least": "*"}, {"text": "Cenderung janji berlebihan", "most": "I", "least": "I"}, {"text": "Tarik diri di tengah tekanan", "most": "*", "least": "C"}, {"text": "Tidak takut bertempur", "most": "*", "least": "D"}]}, {"no": 8, "statements": [{"text": "Penyemangat yang baik", "most": "I", "least": "I"}, {"text": "Pendengar yang baik", "most": "S", "least": "S"}, {"text": "Penganalisa yang baik", "most": "C", "least": "C"}, {"text": "Delegator yang baik", "most": "D", "least": "D"}]}, {"no": 9, "statements": [{"text": "Hasil adalah penting", "most": "D", "least": "D"}, {"text": "Lakukan dengan benar, Akurasi penting", "most": "C", "least": "C"}, {"text": "Dibuat menyenangkan", "most": "*", "least": "I"}, {"text": "Mari kerjakan bersama", "most": "*", "least": "S"}]}, {"no": 10, "statements": [{"text": "Akan berjalan terus tanpa kontrol diri", "most": "*", "least": "C"}, {"text": "Akan membeli sesuai dorongan hati", "most": "D", "least": "D"}, {"text": "Akan menunggu, Tanpa tekanan", "most": "S", "least": "S"}, {"text": "Akan mengusahakan  yang kuinginkan", "most": "I", "least": "*"}]}, {"no": 11, "statements": [{"text": "Ramah, Mudah bergabung", "most": "S", "least": "*"}, {"text": "Unik, Bosan rutinitas", "most": "*", "least": "I"}, {"text": "Aktif mengubah sesuatu", "most": "D", "least": "D"}, {"text": "Ingin hal-hal yang pasti", "most": "C", "least": "C"}]}, {"no": 12, "statements": [{"text": "Non-konfrontasi, Menyerah", "most": "*", "least": "S"}, {"text": "Dipenuhi hal detail", "most": "C", "least": "*"}, {"text": "Perubahan pada menit terakhir", "most": "I", "least": "I"}, {"text": "Menuntut, Kasar", "most": "D", "least": "D"}]}, {"no": 13, "statements": [{"text": "Ingin kemajuan", "most": "D", "least": "D"}, {"text": "Puas dengan segalanya", "most": "S", "least": "*"}, {"text": "Terbuka memperlihatkan perasaan", "most": "I", "least": "*"}, {"text": "Rendah hati, Sederhana", "most": "*", "least": "C"}]}, {"no": 14, "statements": [{"text": "Tenang, Pendiam", "most": "C", "least": "C"}, {"text": "Bahagia, Tanpa beban", "most": "I", "least": "I"}, {"text": "Menyenangkan, Baik hati", "most": "S", "least": "*"}, {"text": "Tak gentar, Berani", "most": "D", "least": "D"}]}, {"no": 15, "statements": [{"text": "Menggunakan waktu berkualitas dgn teman", "most": "S", "least": "S"}, {"text": "Rencanakan masa depan, Bersiap", "most": "C", "least": "*"}, {"text": "Bepergian demi petualangan baru", "most": "I", "least": "I"}, {"text": "Menerima ganjaran atas tujuan yg dicapai", "most": "D", "least": "D"}]}, {"no": 16, "statements": [{"text": "Aturan perlu dipertanyakan", "most": "*", "least": "D"}, {"text": "Aturan membuat adil", "most": "C", "least": "*"}, {"text": "Aturan membuat bosan", "most": "I", "least": "I"}, {"text": "Aturan membuat aman", "most": "S", "least": "S"}]}, {"no": 17, "statements": [{"text": "Pendidikan, Kebudayaan", "most": "*", "least": "C"}, {"text": "Prestasi, Ganjaran", "most": "D", "least": "D"}, {"text": "Keselamatan, keamanan", "most": "S", "least": "S"}, {"text": "Sosial, Perkumpulan kelompok", "most": "I", "least": "*"}]}, {"no": 18, "statements": [{"text": "Memimpin, Pendekatan langsung", "most": "D", "least": "D"}, {"text": "Suka bergaul, Antusias", "most": "*", "least": "I"}, {"text": "Dapat diramal, Konsisten", "most": "*", "least": "S"}, {"text": "Waspada, Hati-hati", "most": "C", "least": "*"}]}, {"no": 19, "statements": [{"text": "Tidak mudah dikalahkan", "most": "D", "least": "D"}, {"text": "Kerjakan sesuai perintah, Ikut pimpinan", "most": "S", "least": "*"}, {"text": "Mudah terangsang, Riang", "most": "I", "least": "I"}, {"text": "Ingin segalanya teratur, Rapi", "most": "*", "least": "C"}]}, {"no": 20, "statements": [{"text": "Saya akan pimpin mereka", "most": "D", "least": "*"}, {"text": "Saya akan melaksanakan", "most": "S", "least": "S"}, {"text": "Saya akan meyakinkan mereka", "most": "I", "least": "I"}, {"text": "Saya dapatkan fakta", "most": "C", "least": "*"}]}, {"no": 21, "statements": [{"text": "Memikirkan orang dahulu", "most": "S", "least": "S"}, {"text": "Kompetitif, Suka tantangan", "most": "D", "least": "D"}, {"text": "Optimis, Positif", "most": "I", "least": "I"}, {"text": "Pemikir logis, Sistematik", "most": "*", "least": "C"}]}, {"no": 22, "statements": [{"text": "Menyenangkan orang, Mudah setuju", "most": "S", "least": "S"}, {"text": "Tertawa lepas, Hidup", "most": "*", "least": "I"}, {"text": "Berani, Tak gentar", "most": "D", "least": "D"}, {"text": "Tenang, Pendiam", "most": "C", "least": "C"}]}, {"no": 23, "statements": [{"text": "Ingin otoritas lebih", "most": "*", "least": "D"}, {"text": "Ingin kesempatan baru", "most": "I", "least": "*"}, {"text": "Menghindari konflik", "most": "S", "least": "S"}, {"text": "Ingin petunjuk yang jelas", "most": "*", "least": "C"}]}, {"no": 24, "statements": [{"text": "Dapat diandalkan, Dapata dipercaya", "most": "*", "least": "S"}, {"text": "Kreatif, Unik", "most": "I", "least": "I"}, {"text": "Garis dasar, Orientasi hasil", "most": "D", "least": "*"}, {"text": "Jalankan standar yang tinggi, Akurat", "most": "C", "least": "*"}]}];

const DEF_ENTRIES = [{"idx": 1, "name": "LOGICAL THINKER", "traits": ["Pendiam", "Anti Kritik", "Perfeksionis", "Cenderung Santai", "Detail", "Empati", "Rapi", "Organized", "Kaku pada Metode & Prosedur"], "career": "Planner (any function), Engineer (Installation, Technical), Technical/Research (Chemist Technician), Academic, Statistician, Government Worker, IT Management, Prison Officer, Quality Controller.", "desc": "Seorang yang praktis, cakap dan unik. Ia orang yang mampu menilai diri sendiri dan kritis terhadap dirinya dan orang lain. Ia menyukai hal yang detil dan logis; secara alamiah ia sangat analitis. Karena menyimpan informasi, ia meneliti isu berulang-ulang kali. Ia cenderung malu dan tertutup; ia hati-hati dalam membuat keputusan yang berdasarkan pada logika, bukan emosi, selalu menggunakan pertanyaan \"bagaimana dan mengapa\". Ia mengerjakan sesuatu dengan sistematis dan akurat. Ia rapi dan terorganisir sebab ia merasa bahwa keadaan berantakan sama dengan mutu yang rendah; demikian juga, rapi dan teratur merupakan mutu yang tinggi. Sangat teliti dalam segala sesuatu seperti halnya dalam pekerjaan dan penggunaan waktunya. Ia merencanakan dan mengorganisir semua sisi kehidupannya. Kelambanan sangat mengganggunya dan tak dapat ditolerir."}, {"idx": 2, "name": "ESTABLISHER", "traits": ["Individualis", "Ego Tinggi, Kurang Sensitif", "Kurang Pertimbangan", "Efektif", "High Motivation", "Bersemangat Tinggi", "Percaya Diri, cenderung Nekat", "Kreatif", "Terlalu Dominan", "Agresif", "Terlalu Dinamis", "Penuh Ambisi"], "career": "Attorney, Researcher, Sales Representative, Planning Consultant, Transport Personnel, Production (Director, Manager, Supervisor), Technologist, Strategic Planning, Trouble Shooting, Marketing Services, Consultant, Engineering (Director, Manager, Supervisor) and Self-Employment.", "desc": "Memiliki rasa ego yang tinggi dan cenderung invidualis dengan standard yang sangat tinggi. Ia lebih suka menganalisa masalah sendirian daripada bersama orang lain. Rasa egoisnya yang kuat membuatnya tidak nyaman di bawah kendali orang lain; ia lebih suka menjadi \"boss\" dan menetapkan standard tinggi baik untuk dirinya maupun orang lain. Ia menghindari sesuatu yang biasa-biasa dan cenderung mencari tantangan yang baru. Ia menyukai petualangan dan kadang-kadang beralih ke dalam petualangan baru sebelum mempertimbangkannya secara menyeluruh. Mampu memimpin situasi dan orang lain dalam rangka mencapai sasarannya; ia ingin selalu unggul dalam persaingan dengan taruhan apapun."}, {"idx": 3, "name": "DESIGNER", "traits": ["Sensitif", "Kurang Cepat", "Anti Tekanan ", "Terlalu Mandiri", "Kurang Percaya Orang Lain", "Anti Kritik", "Dingin", "Kreatif", "Result Oriented", "Suka Tantangan"], "career": "Engineering (Management, Research, Design), Research (R&D), Planning, Chemist, Accountancy, Specialist, Finance, Technician, Quality Control, Production Planning/Management, Design Engineer, Bookkeeper, Chemist Technician, Safety Officer, Librarian.", "desc": "Seorang yang sangat berorientasi pada tugas dan sensitif pada permasalahan. Ia lebih mempedulikan tugas yang ada dibanding orang-orang di sekitarnya, termasuk perasaan mereka. Sangat kukuh/keras dan mempunyai pendekatan yang efektif dalam pemecahan masalah. Oleh karena sifat alamiah dan keinginannya akan hasil yang terukur, Akan tampak dingin, tidak berperasaan dan menjaga jarak. Ia membuat keputusan berdasar pada fakta, bukan emosi. Cenderung pendiam dan tidak mudah percaya."}, {"idx": 4, "name": "NEGOTIATOR", "traits": ["Suka Bergaul", "Anti Rutin", "Aktif", "Terlalu Percaya Diri", "Agresif", "Optimis", "Kurang Detail", "Result Oriented"], "career": "Sales and Marketing (Directing, Manager, Person), Public Relations, Recruitment Consultant, Politician, Director, Self-Employed, Hotelier, Travel Agent, Trainer, Hospitality, Lawyer, Solicitor, Motivators, Team Leader, Politician, Trainer, Lecturer, Theatrical Agent, General Management and Leading People, Attorney.", "desc": "Merupakan seorang pemimpin integratif yang bekerja dengan dan melalui orang lain.  Ia ramah, memiliki perhatian yang tinggi akan orang dan juga mempunyai kemampuan untuk memperoleh hormat dan penghargaan dari berbagai tipe orang.  Melakukan pekerjaannya dengan cara yang bersahabat, baik dalam mencapai sasarannya maupun meyakinkan pandangannya kepada orang lain.  Ia tidak begitu memperhatikan hal-hal kecil.  Kadang bertindak sesuai dengan kata hati/impulsif, terlalu antusias dan sangat banyak bicara.  Ia terlalu berlebihan menilai kemampuannya dalam memotivasi atau mengubah perilaku orang lain.  Mencari kebebasan dari rutinitas, menginginkan otoritas/wewenang dan juga prestise.  Ia menginginkan aktivitas yang bervariasi dan bekerja lebih efisien jika data-data analitis disediakan oleh orang lain.  Menginginkan penugasan yang mengutamakan mobilitas dan tantangan."}, {"idx": 5, "name": "CONFIDENT & DETERMINED", "traits": ["Pandai Memilih Orang", "Leader", "Good Interpersonal Skill", "Dominan", "Agresif", "Perfeksionis", "Good Communication Skill", "Aktif", "Need Recognition n Reward", "Kurang Peduli pada Aturan", "Terburu-buru"], "career": "Specialist/Technical Selling (Computer, Finance, Engineer and others, Chef, Technical/Capital Equipment Selling), Financial (Manager, Specialist), Computer Hardware Sales, Engineering (Manager, Designer, Buyer, Draughtsman), Project Engineer, Sales Engineer, Consultant, Trainer, Lecturer, Hotelier, Insurance, Mortgage and Finance Sales, Teacher, Travel Agent, Personnel and Marketing Services.", "desc": "Sangat berorientasi terhadap tugas dan juga menyukai orang.  Ia sangat baik dalam menarik orang/recruiting.  Seorang yang bersahabat, tetapi menyukai keadaan di mana tugas-tugas harus dilakukan dengan benar.  Ia kadang-kadang tampak dingin dan mendominasi.  Ia juga bisa sangat fokus pada tugas dan melupakan orang-orang di sekitarnya.  Sangat mengharapkan orang-orang terlibat dalam proyeknya, tetapi tidak memperdulikan apa yang diinginkan oleh orang-orang itu.  Ia perlu mendengar dan memikirkan  apa yang menjadi keinginan orang di sekitarnya, khususnya kesempatan untuk mencoba.  Ia sangat membutuhkan persetujuan sosial seperti halnya ia sangat mempercayai orang lain.  Karena itu, ia kadang-kadang berlebihan dalam menilai orang dan kemampuannya.  Ia tampak tidak konsisten dan tidak karuan karena ketidakmampuannya berkonsentrasi dan fokus dalam waktu yang lama.  Perlu belajar untuk secara sungguh-sungguh mendengarkan orang-orang di sekitarnya dari pada selalu berpikir apa yang ingin dikatakan.  Ia mempunyai kemampuan logika yang tinggi ketika ia mau menggunakannya."}, {"idx": 6, "name": "REFORMER", "traits": ["Mudah Bergaul", "Leader", "Sadar Diri", "Butuh Pujian & Penghargaan", "Cepat Percaya Orang", "Mudah Simpati & Empati", "Motivator", "Optimis & Positif", "Anti Aturan", "Kurang Detail", "Terlalu Selektif"], "career": "Hotelier, Customer Service, Complaints Manager, Recruiting Agent, Sales (Manager/Person), Marketing Services, Public Relations, Politician, Computer Software Sales, Lecturer, Engineering and Production (Manager/Supervisor).", "desc": "Seorang yang bersahabat dan sosial; ia juga suka mengendalikan situasi dan menjadi pemimpin.  Ia menyelesaikan tugasnya melalui keterampilan sosialnya; ia peduli dan menerima orang lain.  Ia berkonsentrasi pada tugas yang ada di tangannya sampai selesai dan akan minta bantuan orang lain jika perlu.  Ia menyadari keterbatasannya dan meminta bantuan jika memerlukannya.  Ia disukai dan orang ingin menolongnya.  Senang membagi kebanggaannya dengan kelompok; ia seorang team player tetapi juga team leader.  Menginginkan popularitas dan pengakuan."}, {"idx": 7, "name": "MOTIVATOR", "traits": ["Leader (Kelompok Kecil)", "Supporter", "Sosialisasi Baik", "Butuh Ketegasan", "Butuh Pujian & Penghargaan", "Kurang Detail", "Agak Kaku"], "career": "Hotelier, Community Counseling, Customer Service, Complaints Manager, Community Work, Recruitment Consultant, Hospitality, Teacher, Telemarketing, Production Manager, Complaints Manager, Recruiting Agent, Sales (Manager/Person), Marketing Services, Public Relations, Politician, Call Centre Manager, Lecturer, Engineering and Production (Manager/Supervisor).", "desc": "Seorang yang menampilkan gaya bersemangat ketika termotivasi pada sasaran.  Ia lebih suka memimpin atau melibatkan diri, walaupun ia juga mau melayani sebagai pembantu.  Ia membutuhkan pengakuan dan penghargaan serta senang pada peran pendukung.  Ia peduli kepada orang-orang di sekitarnya dan akan mempertimbangkan perasaan orang lain dalam proses pengambilan keputusan.  Menampilkan keterampilan berhubungan dan berkomunikasi dengan sangat baik.  Ia akan berusaha keras menyelesaikan tugas dengan cepat dan efisien."}, {"idx": 8, "name": "INQUIRER", "traits": ["Full Self Control", "Sabar", "Penuh Pertimbangan", "Good Interpersonal", "Selektif", "Lambat Adaptasi", "Inisiatif kurang", "Result Oriented", "Kaku dan Keras Kepala", "Good Service", "Kurang dlm hal Managerial"], "career": "Directing, Managing or Supervising (in Engineering, Accountancy, Research and Development and Computing disciplines), Research Manager, Scientific Work, Accountant, Administration, Project Engineer, Draughtsman, Designer, Analyst, Finance, Chemist, Technical Service Support, Flight Attendant, Technician, Service Engineer, Service Manager, Security Specialist.", "desc": "Seorang yang sabar, terkontrol dan suka menggali fakta dan jalan keluar.  Ia tenang dan ramah.  Ia merencanakan pekerjaan dengan hati-hati, tetapi agresif, menanyakan sesuatu serta mengumpulkan data pendukung.  Kemudian ia bekerja dengan konsisten dengan arahan yang benar.  Menjadi individu yang penuh perhatian, rendah hati, dan ia berhubungan baik dengan hampir semua orang.  Seorang yang konsisten dan suka menolong. People skill darinya melebihi orientasi tugasnya."}, {"idx": 9, "name": "PENGAMBIL KEPUTUSAN", "traits": ["Pekerja Keras", "Leader", "Banyak Minat", "Dingin / Task Oriented", "Kurang Pergaulan", "Kontrol Emosi Kurang", "Suka Tantangan", "Cepat Bosan", "Anti Aturan", "Kurang Detail", "Kurang Peduli Wewenang", "Argumentatif"], "career": "General Management (Directing/Managing/Supervising, Public Relations, Business Management, Conflict Resolution, Industrial Relations, Business Consultant, Trouble Shooting, Sales and Sales Management, Marketing, Promoting, Production (Director, Manager, Supervisor), Consultancy, Publishing, Sales Executive, Promotional Work, Brokers, Self-Employment, Advertising, Lecturing, Dealing/Broking.", "desc": "Tidak basa-basi dan tegas, ia cenderung merupakan seorang invidualis yang kuat. Ia berpandangan jauh ke depan, progresif dan mau berkompetisi untuk mencapai sasaran. DI seorang yang selalu ingin tahu dan mempunyai minat dengan cakupan yang luas. Ia seorang yang logis, kritis dan tajam dalam memecahkan masalah. Sering kali ia tampak imajinatif. Ia mempunyai kemampuan memimpinan yang baik. Ia kadang tampak keras kepala atau dingin karena orientasi dan prioritasnya pada tugas cenderung melebihi orientasi terhadap sesama. Ia mencanangkan standard tinggi pada dirinya dan akan sangat kritis ketika standard ini tidak dicapai. Ia juga menempatkan standard tinggi pada orang-orang di sekitarnya, serta mengutamakan kesempurnaan. Ia menginginkan otoritas yang jelas dan menyukai tugas-tugas baru."}, {"idx": 10, "name": "DIRECTOR", "traits": ["Pengelola", "Enerjik", "Kurang Detail", "Mudah Bosan", "Agresif", "Arogan", "Kurang Focus"], "career": "Engineering and Production (Directing, Managing, Supervising), Sales, Sales Management, Service Manager, Distribution, Public Relations, Office Management, Account Manager, Customer Service, Retail Manager, IT, Lecturer, Logistics, Manager-General, National Accounts Manager, Teacher, Projects Manager.", "desc": "Fokus pada penyelesaian pekerjaan dan menunjukkan penghargaan yang tinggi kepada orang lain.  Ia memiliki kemampuan untuk menggerakkan orang dan pekerjaan dikarenakan keterampilannya berpikir ke depan dan hubungan antar manusia.  Tidak berorientasi detil, ia fokus pada target secara keseluruhan dengan menyerahkan hal detil kepada orang lain.  Enerjik dan sosial, ia mampu memotivasi orang lain sambil menyelesaikan pekerjaannya.  Ia menampilkan rasa percaya diri dan mampu meyakinkan orang lain.  Sekali ia memutuskan sesuatu, ia akan terus mengerjakannya dan bertahan sampai selesai."}, {"idx": 11, "name": "SELF-MOTIVATED", "traits": ["Objektif & Analitis", "Mandiri", "Good Planner", "Komitmen thd Target", "Menghindari Konflik"], "career": "Engineering and Production (Directing, Managing, Supervising), Project Management, Researcher, Chemist (R&D), Planner, Engineering (R&D), Systems Analyst, Commercial Planner, Computer Engineer, Programmer, IT, Other computer-related disciplines, Technical Trouble Shooting and Directing, Lawyer, Solicitor, Development Engineer, Work Study, Barrister, Attorney.", "desc": "Seorang yang obyektif dan analitis.  Ia ingin terlibat dalam situasi, dan ia juga ingin memberikan bantuan dan dukungan kepada orang yang ia hormati.  Secara internal termotivasi oleh target pribadi, ia berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama.  Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya.  Ulet dalam memulai pekerjaan. Ia akan berusaha keras untuk mencapai sasarannya.  Seorang yang mandiri dan cermat serta memiliki tindak lanjut yang baik."}, {"idx": 12, "name": "MEDIATOR", "traits": ["Loyal", "Tight Scheduled", "Curious", "Sensitif", "Good Communication Skill", "Good Analitical Think", "Good Interpersonal Skill", "Cepat Beradaptasi", "Anti Kritik", "Not Leader", "Work/Play Conflict"], "career": "Engineering and Production (Supervisor, Installer, Technician, Service and Design), Research (Supervisor, Chemist, Lab. Technician), Trainer, Finance (Supervisor, Accountant, Advisor), Public Relations, Administration, Office Administrator, Market Analyst, System Analyst, Programmer, Selling (Technical/Service).", "desc": "Merupakan individu yang berorientasi pada orang, ia mampu menggabungkan ketepatan dan loyalitas.  Ia cenderung peka dan mempunyai standard yang tinggi.  Ia menginginkan stabilitas dan berorientasi terhadap sasaran.  Ia menginginkan pengakuan sosial dan perhatian pribadi.  Ia bersahabat, antusias, informal, banyak bicara, dan mungkin sangat mencemaskan apa yang dipikirkan oleh orang lain.  Ia menolak agresi, dan mengharapkan suasana harmonis.  Ia cenderung cukup cerdas dalam berbagai hal. Ia merupakan pencari fakta yang sangat baik dan akan membuat keputusan yang baik setelah mengumpulkan fakta dan data pendukung."}, {"idx": 13, "name": "PRACTITIONER", "traits": ["Perfeksionis", "Quality Oriented", "Scheduled", "Anti Kejutan", "Good Interpersonal Skill", "Terlalu Detail", "Sistematis", "Kaku / Tidak fleksibel", "Monoton"], "career": "Engineering and Production (Supervisor, Installer, Technician, Service and Design), Research (Supervisor, Chemist), Trainer, Finance (Manager, Supervisor, Accountant, Advisor), Public Relations-Administration, Purchasing, Chemist Research, Office Administrator, Computer Programmer, Market Analyst, System Analyst, Programmer, Research and Development Supervisor, Laboratory Technician, Legal, Selling (Technical/Service).", "desc": "Merupakan individu yang berorientasi pada orang, ia mampu menggabungkan ketepatan dan loyalitas.  Ia cenderung peka dan mempunyai standard yang tinggi.  Ia menginginkan stabilitas dan berorientasi terhadap sasaran.  Ia menginginkan pengakuan sosial dan perhatian pribadi.  Bersahabat, antusias, informal, banyak bicara, dan mungkin sangat mencemaskan apa yang dipikirkan oleh orang lain.  Ia menolak agresi dan mengharapkan suasana harmonis.  Ia cenderung cukup cerdas dalam berbagai hal. Ia merupakan pencari fakta yang sangat baik dan akan membuat keputusan yang baik setelah mengumpulkan fakta dan data pendukung."}, {"idx": 14, "name": "RESPONSIVE & THOUGHTFUL", "traits": ["High Energy", "Good Communication Skill", "To The Point", "Sensitif", "Banyak Bicara", "Need Recognation", "Need Socialism", "Anti thd Kritik", "Terlalu banyak bersosialisasi", "Leadership kurang", "Kurang Fokus", "Anti Deadline"], "career": "Actors, Chef, Personnel, Welfare, Broadcasting, Training, Attorney, Teaching, Accounting, Technical Instructor, Accounting-General, Accounts Supervisor, Customer Services, Public Relations, Artist, Hotelier, Demonstrator, Florist/Floral Designer, Engineering (Sales, Service, Project, Draughtsman, Designer), Graphic Designer, Specialist (Soft/Services), Selling, Purchasing, Singers, Technical Instructor, Personnel Management, Politician, Supervising (Engineering, Production, Accounts), Administration Work, Sales Engineer, Secretarial, Industrial Relations Specialist.", "desc": "Merupakan individu yang berorientasi pada orang dan lancar berkomunikasi serta loyal.  Ia cenderung sensitif dan mempunyai standard yang tinggi.  Keputusannya dibuat berdasarkan fakta dan data pendukung.  Ia sepertinya tidak bisa diam.  Ia perlu untuk lebih terus terang dan jangan terlalu subyektif.  Ia butuh pengakuan sosial dan perhatian pribadi; ia dapat cepat akrab dengan orang lain.  Ia bersahabat, antusias, informal, banyak bicara dan terlalu khawatir terhadap apa yang dipikirkan orang.  Ia menguasai banyak hal.  Ia ingin diterima sebagai anggota kelompok dan ingin mengetahui secara pasti apa yang diharapkan darinya sebelum ia memulai proyek baru."}, {"idx": 15, "name": "SPECIALIST", "traits": ["Stabil & Konsisten", "Terkendali", "Nyaman di Belakang Layar", "Sabar", "Loyal", "Sulit Adaptasi", "Process Oriented", "Teguh", "Need for Peace", "Anti Perubahan", "Sulit Menentukan Prioritas"], "career": "Administrative Work, Engineering and Production areas (Sales, Services, Project, Painter, Plumber, Draughtsman, Designer, Operative), Chef, Accounting, Telemarketing/Tele-Sales, Research and Development, Administrator, Florist/Floral Designer, Retail-General, Sales-General, Accounting-General, Service-General, Landscape Gardener.", "desc": "Merupakan individu konsisten yang berusaha menjaga lingkungan/suasana yang tidak berubah.  Ia bekerja dengan baik bersama orang-orang dengan berbagai kepribadian karena perilakunya yang terkendali dan rendah hati.  Sabar, loyal dan suka menolong.  Persahabatan dikembangkannya dengan lambat dan selektif.  Ia tidak bosan dengan rutinitas dan sangat baik bekerja dengan petunjuk dan peraturan yang jelas. Ia mengharapkan bantuan dan supervisi pada saat mengawali proyek baru.  Ia butuh waktu untuk menyesuaikan diri dengan perubahan dan sungkan menjalankan \"cara-cara lama mengerjakan sesuatu\".  Ia akan menghindari konfrontasi dan berusaha sekuat tenaga memendam perasaannya."}, {"idx": 16, "name": "PERFECTIONIST", "traits": ["Detail & Teliti", "Butuh Situasi Stabil", "Sistematik & Prosedural", "Menghindari Konflik", "Anti Kritik", "Lambat Memutuskan", "Sulit Adaptasi", "Pendendam", "Anti Perubahan"], "career": "Researcher (Technician, Chemist, Quality Control), Engineer (Project, Draughtsman, Armed Forces, Designer), Statistician, Surveyor, Optician, Medical Specialist, Health Care, IT Management, Planner, Technical Writing, Production, Dentist, Quality Control, Planning, Dental Technician, Accounting, Computer Programmer, Psychologist, Surgeon, Architect, Medical Specialist.", "desc": "Berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaannya.  Teratur dan memiliki perencanaan yang baik, ia teliti dan fokus pada detil.  Bertindak dengan penuh kebijaksanaan, diplomatis dan jarang menentang rekan kerjanya dengan sengaja.  Ia sangat berhati-hati, sungguh-sungguh mengharapkan akurasi dan standard tinggi dalam pekerjaannya.  Ia cenderung terjebak dalam hal detil, khususnya jika harus memutuskan.  Menginginkan adanya petunjuk standard pelaksanaan kerja dan tanpa perubahan mendadak."}, {"idx": 17, "name": "PEACEMAKER, RESPECTFULL & ACCURATE", "traits": ["Sulit Beradaptasi", "Anti Kritik", "Pendendam", "Sukar Berubah", "Detail", "Empati", "Memikirkan Dampak ke Orang Lain", "Terlalu Mendalam dalam Berpikir", "Concern ke Data dan Fakta", "Introvert", "Loyal"], "career": "Office (Manager, Supervisor, Person), Chief Clerk, General Administrator, Production Supervisor, Planner, Accountant, Research and Development, Flight Attendant, Engineering (Project Manager, Supervisor, Technician), Computer Programmer, Draughtsman, Soft/Service Selling, Doctor, Cashier, Receptionist, Data Entry, Planner, Word Processing, Property Manager, Database Administrator, Health Care, Statistician, Nursing-Administration, Company Secretary, System Analyst, Programmer, Statistician, Accounting-General, Security Specialist.", "desc": "Ia adalah orang yang baik secara alamiah dan sangat berorientasi detil.  Ia peduli dengan orang-orang di sekitarnya dan mempunyai kualitas yang membuatnya sangat teliti dalam penyelesaian tugas.  Ia mempertimbangkan sekelilingnya dengan hati-hati sebelum membuat keputusan untuk melihat pengaruhnya pada mereka; saat tertentu ia terlalu hati-hati.  Jika ia merasa seseorang memanfaatkan situasi, ia akan memperlambat kerjanya sehingga dapat mengamati apa yang sedang berlangsung di sekitarnya."}, {"idx": 18, "name": "CHALLENGER", "traits": ["Seorang yang tekun", "Sensitif terhadap permasalahan", "Mempunyai keputusan yang kuat", "Kreatif  dalam memecahkan masalah", "Memiliki reaksi yang cepat", "Mampu mencari solusi permasalahan", "Banyak memberikan ide-ide.", "Usaha yang keras pada ketepatan", "Cenderung perfeksionis"], "career": "Engineering (Management, Research, Design), Actuaries, Research (R&D), Planning, Chemist, Hospital Supervisor, Industrial Marketing, Investment Banking, Medical Administrator, Mortgage Brokers, Accountancy, Fund Management, Specialist Finance, Quality Control and Specialist work in any area where knowledge and experience is available, Production, Financial Services, Technical Management, Project Leader, Matron, Strategic Planning, Industrial Marketing.", "desc": "Seorang yang sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. Ia dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. Seorang yang tekun dan memiliki reaksi yang cepat.  Ia akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan.  Ia banyak memberikan ide-ide dengan berfokus pada pekerjaan. Usaha yang keras pada ketepatan akan mengimbangi keinginannya pada hasil yang terukur.  Ia cenderung perfeksionis dan dapat juga memperlambat pengambilan keputusan karena keinginannya untuk menentukan pilihan yang terbaik."}, {"idx": 19, "name": "CHANCELLOR", "traits": ["Seorang yang ramah secara alami", "Menggabungkan kesenangan dengan pekerjaan", "Menyukai hubungan dengan sesama", "Menikmati interaksi dengan sesama", "Dapat mengerjakan hal-hal detil", "Ingin melakukan segala sesuatu dengan tepat", "Menilai orang dan tugas secara hati-hati", "Sering melalaikan perencanaan yang seksama", "Mudah beralih kepada proyek-proyek baru"], "career": "Technical/Scientific (Directing, Management, Supervision), Engineering, Finance, Production Planning, Personnel Disciplines, Self-Employment, Credit Manager, Planner, Fund Management, Computer Hardware/Software Sales, IT, Business Consultant, Banking, Logistics, Lecturing, Work Study, Film Director, Transport, Consultancy, Industrial Relations and Computers (Selling, Software, Systems Analyst) and General Manager.", "desc": "Ia menggabungkan antara kesenangan dengan pekerjaan/bisnis ketika melakukan sesuatu. Ia kelihatan menyukai hubungan dengan sesama tetapi juga dapat mengerjakan hal-hal detil. Ia ingin melakukan segala sesuatu dengan tepat, dan ia akan menyelesaikan tugasnya untuk meyakinkan ketepatan dan kelengkapannya. Seorang yang ramah secara alami dan menikmati interaksi dengan sesama, akan tetapi ia akan juga menilai orang dan tugas secara hati-hati; persahabatannya akan bergeser sesuai dengan dorongan hatinya pada orang lain di sekitarnya. Ia sering melalaikan perencanaan yang seksama dan akan beralih ke pada proyek-proyek baru tanpa pertimbangan yang menyeluruh."}, {"idx": 20, "name": "DIRECTOR", "traits": ["Seorang yang obyektif dan analitis", "Ingin terlibat dalam situasi", "Ingin memberikan bantuan dan dukungan", "Termotivasi oleh target pribadi", "Berorientasi terhadap pekerjaannya", "Menyukai hubungan dengan sesama", "Mempunyai determinasi yang kuat", "Karakternya tenang", "Stabil dan daya tahannya tinggi", "Ulet dalam memulai pekerjaan", "Berusaha keras mencapai sasarannya", "Mandiri dan cermat"], "career": "Engineering and Production (Directing, Managing, Supervising), Sales, Sales Management, Service Manager, Distribution, Public Relations, Creative Designer, Office Management, Chief Engineer, Business Consultant, Chief Financial Officer, Customer Service, National Accounts Manager, Chief Accountant, Lecturer, Projects Manager, Research Planning, Human Resources, Scientific Work, Security Specialist, Solicitor, Planner, Production Administrator.", "desc": "Seorang yang obyektif dan analitis.  Ia ingin terlibat dalam situasi, dan ia juga ingin memberikan bantuan dan dukungan kepada orang yang ia hormati.  Secara internal termotivasi oleh target pribadi, ia berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama.  Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya.  Ulet dalam memulai pekerjaan. Ia akan berusaha keras untuk mencapai sasarannya.  Seorang yang mandiri dan cermat serta memiliki tindak lanjut yang baik."}, {"idx": 21, "name": "Director", "traits": ["Seorang yang obyektif dan analitis", "Ingin terlibat dalam situasi", "Ingin memberikan bantuan dan dukungan", "Termotivasi oleh target pribadi", "Berorientasi terhadap pekerjaannya", "Menyukai hubungan dengan sesama", "Mempunyai determinasi yang kuat", "Karakternya tenang", "Stabil dan daya tahannya tinggi", "Ulet dalam memulai pekerjaan", "Berusaha keras mencapai sasarannya", "Mandiri dan cermat"], "career": "Engineering and Production (Directing, Managing, Supervising), Sales, Sales Management, Service Manager, Distribution, Public Relations, Creative Designer, Office Management, Chief Engineer, Business Consultant, Chief Financial Officer, Customer Service, National Accounts Manager, Chief Accountant, Lecturer, Projects Manager, Research Planning, Human Resources, Scientific Work, Security Specialist, Solicitor, Planner, Production Administrator.", "desc": "Seorang yang obyektif dan analitis.  Ia ingin terlibat dalam situasi, dan ia juga ingin memberikan bantuan dan dukungan kepada orang yang ia hormati.  Secara internal termotivasi oleh target pribadi, ia berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama.  Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya.  Ulet dalam memulai pekerjaan. Ia akan berusaha keras untuk mencapai sasarannya.  Seorang yang mandiri dan cermat serta memiliki tindak lanjut yang baik."}, {"idx": 22, "name": "CHALLENGER", "traits": ["Seorang yang tekun", "Sensitif terhadap permasalahan", "Mempunyai keputusan yang kuat", "Kreatif  dalam memecahkan masalah", "Memiliki reaksi yang cepat", "Mampu mencari solusi permasalahan", "Banyak memberikan ide-ide.", "Usaha yang keras pada ketepatan", "Cenderung perfeksionis"], "career": "Technical/Scientific (Directing, Management, Supervision), Engineering, Finance, Production Planning, Personnel Disciplines, Self-Employment, Credit Manager, Planner, Lecturing, Work Study, Transport, Consultancy, Industrial Relations and Computers (Selling, Software, Systems Analyst) and General Manager.", "desc": "Seorang yang sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. Ia dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. Seorang yang tekun dan memiliki reaksi yang cepat.  Ia akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan.  Ia banyak memberikan ide-ide dengan berfokus pada pekerjaan. Usaha yang keras pada ketepatan akan mengimbangi keinginannya pada hasil yang terukur.  Ia cenderung perfeksionis dan dapat juga memperlambat pengambilan keputusan karena keinginannya untuk menentukan pilihan yang terbaik."}, {"idx": 23, "name": "CHALLENGER", "traits": ["Seorang yang tekun", "Sensitif terhadap permasalahan", "Mempunyai keputusan yang kuat", "Kreatif  dalam memecahkan masalah", "Memiliki reaksi yang cepat", "Mampu mencari solusi permasalahan", "Banyak memberikan ide-ide.", "Usaha yang keras pada ketepatan", "Cenderung perfeksionis"], "career": "Engineering, Production and Finance (Directing, Administrating, Managing and Managing Specialist Work), Scientific, Research Planning, Personnel, Trouble Shooting, Credit Control, Chief Accountant, Accountant, Chief Engineer, Work Study, Consultancy, Designer, Draughtsman, Project Work, Security Specialist, Doctor, Attorney.", "desc": "Seorang yang sensitif terhadap permasalahan, dan memiliki kreativitas yang baik dalam memecahkan masalah. Ia dapat menyelesaikan tugas-tugas penting dalam waktu singkat karena mempunyai keputusan yang kuat. Seorang yang tekun dan memiliki reaksi yang cepat.  Ia akan meneliti dan mengejar semua kemungkinan yang ada dalam mencari solusi permasalahan.  Ia banyak memberikan ide-ide dengan berfokus pada pekerjaan. Usaha yang keras pada ketepatan akan mengimbangi keinginannya pada hasil yang terukur.  Ia cenderung perfeksionis dan dapat juga memperlambat pengambilan keputusan karena keinginannya untuk menentukan pilihan yang terbaik."}, {"idx": 24, "name": "COMMUNICATOR", "traits": ["Antusias", "Percaya", "Optimis", "Persuasif", "Bicara aktif", "Impulsif", "Emosional", "Ramah", "Inspirasional"], "career": "Promoting, Demonstrating, Canvassing, Marketing Services, Public Relations, Lecturing, Advertising, Publican, Publishing, Hospitality, Retail-General, Human Resources, Journalist, Singers, Technical Writing, Tour Guide, Promotional Work, Hotelier, Dancers, Host, Actors, Travel Agent, Politician, and very soft selling.", "desc": "Merupakan seorang yang antusias dan optimistik, ia lebih suka mencapai sasarannya melalui orang lain. Ia suka berhubungan dengan sesamanya - ia bahkan suka mengadakan “pesta” atau kegiatan untuk berkumpul, dan ini menunjukkan kepribadiannya yang ramah. Ia tidak suka bekerja sendirian dan cenderung bersama dengan orang lain dalam menyelesaikan proyek.  Perhatian dan fokusnya tidak sebaik apa yang dia inginkan -  maka ia membutuhkan energi yang besar untuk mampu bergerak cepat dari satu hal ke hal berikutnya tanpa penundaan.  Ia sangat menonjol dalam keterampilan berkomunikasi, dan ini merupakan salah satu kekuatan yang paling sering digunakan.  Ia memiliki kemampuan untuk memotivasi dan memberi semangat dengan kata-katanya, dan ia dikenal sebagai individu yang inspirasional. Ketika ia harus memusatkan perhatiannya pada tugas, Ia akan menjadi tidak akurat dan bahkan tidak terorganisir.  Tetapi ia akan memusatkan perhatian kepada yang harus ia senangkan, karena ia enggan sekali untuk menolak.  Ia menginginkan pengakuan sosial dan takut akan penolakan.  Ia mudah menemukan teman dan berusaha menciptakan suasana yang menyenangkan.  Ia membutuhkan seorang manajer atau supervisor untuk menentukan batas waktu yang jelas dalam pekerjaannya, ia lebih suka menggunakan gaya manajemen partisipatif yang dibangun berdasarkan hubungan yang kuat."}, {"idx": 25, "name": "ADVISOR", "traits": ["Hangat", "Simpati", "Tenang dalam situasi sosial", "Pendengar yang baik", "Demonstratif", "Tidak memaksakan idenya pada orang lain", "Kurang tegas dalam memberi perintah", "Menerima kritik", "Toleran dan sabar", "Penjaga damai"], "career": "Personnel, Welfare, Training, Hotelier, Promoting, Travel Agent, Lecturing, Upmarket/Speciality Sales, Soft/Service Selling, Beauty Therapist, Psychologist, Nursing, Human Resources, Retail-Specialist, Veterinarian, Social Work, Personal Assistant, Personnel-HR, Coach, Mentor.", "desc": "Seorang yang mengesankan orang akan kehangatan, simpati dan pengertiannya.  Ia memiliki ketenangan dalam sebagian besar situasi sosial dan jarang tidak menyenangkan orang lain.  Faktanya, banyak orang datang padanya karena ia kelihatan sebagai pendengar yang baik.  Ia cenderung sangat demonstratif dan emosinya biasanya tampak jelas bagi orang di sekitarnya.  Ia tidak akan memaksakan idenya pada orang lain; ia tidak tegas dalam mengekspresikan atau memberi perintah.  Jika ia sangat kuat merasakan sesuatu, Ia akan bicara secara terbuka dan terus terang tentang pendiriannya.  Ia cenderung menerima kritik atas pekerjaannya sebagai serangan pribadi.  Ia dapat menjadi sangat toleran dan sabar kepada mereka yang tidak produktif di pekerjaan.  Ia merupakan \"penjaga damai\" dan akan bekerja untuk menjaga kedamaian dalam setiap keadaan."}, {"idx": 26, "name": "ASSESSOR", "traits": ["Ramah", "Suka berteman", "Nyaman walapun dengan orang asing", "Mudah mengembangkan hubungan baru", "Dapat mengendalikan diri", "Sangat sosial", "Cenderung perfeksionis alamiah", "Mempromosikan tugas-tugas orang lain"], "career": "Teaching, Training, Inventing, Specialist Selling (Engineering, Finance or any area involving capital equipment), Project Engineer, Finance, Service Engineer or Supervising within a Technical/Specialist Area, Public Relations, Environmentalist, Marketing, Conference Organiser, Estate Agent.", "desc": "Merupakan seorang yang ramah dan suka berteman; ia merasa nyaman walaupun dengan orang asing. Ia dapat mengembangkan hubungan baru dengan mudah, dan pada umumnya dapat mengendalikan diri sampai pada tingkat dimana ia jarang menimbulkan rasa benci pada orang lain dengan sengaja. Ia seorang yang sangat sosial, menunjukkan kepedulian dan persahabatan ketika sedang melakukan tugas-tugas di tangannya. Ia cenderung perfeksionis secara alamiah, dan akan mengisolasi dirinya jika diperlukan untuk melaksanakan pekerjaan.  Ia berkeinginan mempromosikan tugas-tugas orang lain, juga kepunyaannya.  Kadang-kadang ia salah menilai kemampuan orang lain dikarenakan pandangan-pandangannya yang optimis."}, {"idx": 27, "name": "ASSESSOR", "traits": ["Analitis", "Berwatak hati-hati", "Ramah pada saat merasa nyaman", "Sangat biasa dengan orang asing", "Mudah mengembangkan hubungan baru", "Dapat mengendalikan diri", "Peduli dan ramah", "Memusatkan perhatian pada penyelesaian tugas", "Perfeksionis secara alami", "Mengisolasi dirinya jika diperlukan", "Mudah diramalkan", "Berorientasi pada kualitas"], "career": "Specialist/Technical Selling (Computer, Finance, Engineer and others, Technical/Capital Equipment Selling), Financial (Manager, Specialist), Engineering (Manager, Designer, Buyer, Draughtsman), Project Engineer, Sales Engineer, Consultant, Trainer, Lecturer, Hotelier, Travel Agent, Personnel and Marketing Services.", "desc": "Merupakan seseorang yang analitis, berwatak hati-hati dan ramah pada saat merasa nyaman. Ia sangat biasa dengan orang asing, karena ia dapat menilai dan menyesuaikan diri dalam hubungan mereka. Ia dapat mengembangkan hubungan baru dengan mudah ketika ia ingin melakukannya, dan pada umumnya dapat mengendalikan diri sampai pada tingkat di mana ia jarang menimbulkan rasa benci pada orang lain dengan sengaja. Ia menampilkan sikap peduli dan ramah, namun mampu memusatkan perhatian pada penyelesaian tugas yang ada. Ia cenderung perfeksionis secara alami, dan akan mengisolasi dirinya jika diperlukan untuk melaksanakan pekerjaan. Ia suka berada pada situasi yang dapat diramalkan dan tidak ada kejutan. Ia sangat berorientasi pada kualitas dan akan bekerja dengan keras untuk menyelesaikan pekerjakan dengan benar. Ia ingin orang-orang berkenan akan pekerjaan yang sudah ia selesaikan dengan baik."}, {"idx": 28, "name": "RESPONSIVE & THOUGHTFUL", "traits": ["High Energy", "Good Communication Skill", "To The Point", "Sensitif", "Banyak Bicara", "Need Recognation", "Need Socialism", "Anti thd Kritik", "Terlalu banyak bersosialisasi", "Leadership kurang", "Kurang Fokus", "Anti Deadline"], "career": "Personnel, Welfare, Training, Attorney, Teaching, Accounting, Technical Instructor, Customer Services, Public Relations, Artist, Hotelier, Demonstrator, Engineering (Sales, Service, Project, Draughtsman, Designer), Specialist (Soft/Services), Selling, Purchasing, Supervising (Engineering, Production, Accounts), Administration Work, Secretarial, Industrial Relations Specialist.", "desc": "Merupakan individu yang berorientasi pada orang dan lancar berkomunikasi serta loyal.  Ia cenderung sensitif dan mempunyai standard yang tinggi.  Keputusannya dibuat berdasarkan fakta dan data pendukung.  Ia sepertinya tidak bisa diam.  Ia perlu untuk lebih terus terang dan jangan terlalu subyektif.  Ia butuh pengakuan sosial dan perhatian pribadi; ia dapat cepat akrab dengan orang lain.  Ia bersahabat, antusias, informal, banyak bicara dan terlalu khawatir terhadap apa yang dipikirkan orang.  Ia menguasai banyak hal.  Ia ingin diterima sebagai anggota kelompok dan ingin mengetahui secara pasti apa yang diharapkan darinya sebelum ia memulai proyek baru."}, {"idx": 29, "name": "SELF-MOTIVATED", "traits": ["Objektif & Analitis", "Mandiri", "Good planner", "Komitmen terhadap target", "Menghindari konflik", "Ingin terlibat dalam situasi", "Ingin memberikan bantuan dan dukungan", "Termotivasi oleh target pribadi", "Stabil", "Tekun"], "career": "Investigator, Researcher, Accountant, Engineering, Production/Engineering Supervisor, Computer Specialist, Architect, Transport/Warehouse Supervisor, Credit Controller, DP Supervisor, Computer Specialist, Research and Development, Private Investigator, Quality Controller, Engineering (Designer, Draughtsman, Project Engineer), Sales and Service Engineer, Property Manager, Attorney, Administration Manager", "desc": "Merupakan seorang yang obyektif dan analitis.  Ia ingin terlibat dalam situasi, dan juga ingin memberikan bantuan dan dukungan.  Secara internal termotivasi oleh target pribadi, Ia menyukai orang-orang, tetapi juga mempunyai kemampuan untuk berorientasi pada pekerjaannya pada saat dibutuhkan.  Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya memiliki kontribusi akan keberhasilannya.  Keuletannya setelah memulai pekerjaan, ia akan berusaha keras untuk mendapatkan sasarannya.  Seorang yang bebas, ia orang yang cermat dan memiliki tindak lanjut yang baik.  Ia bisa menjadi tidak ramah walaupun ia pada dasarnya ia yang berorientasi pada orang; dan pada situasi yang tidak membuatnya nyaman, ia lebih suka mendukung pemimpinnya dari pada keterlibatannya dengan situasi."}, {"idx": 30, "name": "ADVISOR", "traits": ["Hangat", "Simpati dan Pengertian", "Tenang dalam situasi sosial", "Pendengar yang baik", "Demonstratif", "Tidak memaksakan idenya pada orang lain", "Kurang tegas dalam memberi perintah", "Menerima kritik", "Toleran dan sabar", "Penjaga damai"], "career": "Personnel Welfare, Training, Hotelier, Promoting, Travel Agent, Lecturing, Child Care, Charitable Organizations, Soft or Service Selling, Psychologist, Therapist, Nurse, Personal Assistant, Hospitality Manager, Social Work, Student Services, Upmarket/Speciality Sales.", "desc": "Seorang yang mengesankan orang akan kehangatan, simpati dan pengertiannya.  Ia memiliki ketenangan dalam sebagian besar situasi sosial dan jarang tidak menyenangkan orang lain.  Faktanya, banyak orang datang padanya karena ia kelihatan sebagai pendengar yang baik.  Ia cenderung sangat demonstratif dan emosinya biasanya tampak jelas bagi orang di sekitarnya.  Ia tidak akan memaksakan idenya pada orang lain; ia tidak tegas dalam mengekspresikan atau memberi perintah.  Jika ia sangat kuat merasakan sesuatu, Ia akan bicara secara terbuka dan terus terang tentang pendiriannya.  Ia cenderung menerima kritik atas pekerjaannya sebagai serangan pribadi.  Ia dapat menjadi sangat toleran dan sabar kepada mereka yang tidak produktif di pekerjaan.  Ia merupakan \"penjaga damai\" yang sebenarnya dan akan bekerja untuk menjaga kedamaian dalam setiap keadaan."}, {"idx": 31, "name": "DIRECTOR", "traits": ["Seorang yang obyektif dan analitis", "Ingin terlibat dalam situasi", "Ingin memberikan bantuan dan dukungan", "Termotivasi oleh target pribadi", "Berorientasi terhadap pekerjaannya", "Menyukai hubungan dengan sesama", "Mempunyai determinasi yang kuat", "Karakternya tenang", "Stabil dan daya tahannya tinggi", "Ulet dalam memulai pekerjaan", "Berusaha keras mencapai sasarannya", "Mandiri dan cermat"], "career": "Engineering and Production (Supervision), Service Selling, Distribution and Warehouse Supervision/Manager, Office Management, Customer Service, System Analyst, Radio Announcer, Technical Writing, Telemarketing, TV Presenter, Project Engineer, Film Producer, Programmer, Sales/Service Engineer, Accounting, Draughtsman, Project Engineer.", "desc": "Seorang yang obyektif dan analitis.  Ia ingin terlibat dalam situasi, dan ia juga ingin memberikan bantuan dan dukungan kepada orang yang ia hormati.  Secara internal termotivasi oleh target pribadi, ia berorientasi terhadap pekerjaannya tapi juga menyukai hubungan dengan sesama.  Karena determinasinya yang kuat, ia sering berhasil dalam berbagai hal; karakternya yang tenang, stabil dan daya tahannya yang tinggi memiliki kontribusi dalam keberhasilannya.  Ulet dalam memulai pekerjaan. Ia akan berusaha keras untuk mencapai sasarannya.  Seorang yang mandiri dan cermat serta memiliki tindak lanjut yang baik."}, {"idx": 32, "name": "ADVISOR", "traits": ["Hangat", "Simpati dan Pengertian", "Tenang dalam situasi sosial", "Pendengar yang baik", "Demonstratif", "Tidak memaksakan idenya pada orang lain", "Kurang tegas dalam memberi perintah", "Menerima kritik", "Toleran dan sabar", "Penjaga damai"], "career": "Engineering and Production (Supervision), Service Selling, Distribution and Warehouse Supervision, Office Management, Customer Service, System Analyst, Programmer, Sales/Service Engineer, Accounting, Draughtsman, Project Engineer.", "desc": "Seorang yang mengesankan orang akan kehangatan, simpati dan pengertiannya.  Ia memiliki ketenangan dalam sebagian besar situasi sosial dan jarang tidak menyenangkan orang lain.  Faktanya, banyak orang datang padanya karena ia kelihatan sebagai pendengar yang baik.  Ia cenderung sangat demonstratif dan emosinya biasanya tampak jelas bagi orang di sekitarnya.  Ia tidak akan memaksakan idenya pada orang lain; ia tidak tegas dalam mengekspresikan atau memberi perintah.  Jika ia sangat kuat merasakan sesuatu, Ia akan bicara secara terbuka dan terus terang tentang pendiriannya.  Ia cenderung menerima kritik atas pekerjaannya sebagai serangan pribadi.  Ia dapat menjadi sangat toleran dan sabar kepada mereka yang tidak produktif di pekerjaan.  Ia merupakan \"penjaga damai\" yang sebenarnya dan akan bekerja untuk menjaga kedamaian dalam setiap keadaan."}, {"idx": 33, "name": "ADVOCATE", "traits": ["Stabil", "Ramah", "Detail ketika situasi membutuhkan", "Cenderung individualis", "Teguh pendirian", "Menyukai hubungan dengan orang", "Mendukung pihak yang lemah", "Ingin diterima sebagai anggota tim", "Ingin orang lain menyukainya", "Sulit membuat keputusan", "Moderat", "Cermat dan dapat diandalkan"], "career": "Personnel Welfare, Training, Teaching, Attorney, Accounting, Technical Instructor, Customer Service, Public Relations, Artist, Hotelier, Demonstrator, Engineer (Sales, Service, Project, Draughtsman, Designer), Specialist (Soft/Service), Selling, Purchasing, Supervising (Engineering, Production, Accounts) Administrative Work, Secretarial.", "desc": "Merupakan orang yang stabil, individu yang ramah yang berusaha keras membangun hubungan yang positif di tempat kerja dan di rumah.  Ia dapat menjadi sangat berorientasi detil ketika situasi membutuhkan; tetapi secara keseluruhan ia cenderung individualis, independen dan sedikit perhatian terhadap detil.  Sekali dia membuat keputusan, sangat sulit mengubah pendiriannya.  Ia menyukai hubungan dengan orang dan cenderung mendukung pihak yang lemah.  Ia akan mengambil posisi berlawanan dengan ketidaksepakatan dan merasa frustrasi jika sesuatu tidak sejalan dengannya.  Ia ingin diterima sebagai anggota tim, dan ia menginginkan orang lain menyukainya.  Ia cukup sulit membuat keputusan sampai parameter wewenang secara jelas ditentukan, dan ia mungkin cenderung tidak sungguh-sungguh jika dipaksa membuat keputusan ketika ia tidak ingin melakukannya.  Ia menginginkan orang lain yang membuat keputusan, khususnya jika ada orang yang sangat ia hargai dan hormati.  Ia cenderung moderat, cermat dan dapat diandalkan."}, {"idx": 34, "name": "INQUIRER", "traits": ["Seorang yang baik", "Sangat berorientasi pada detil", "Sangat teliti dalam penyelesaian tugas", "Sangat berhati-hati", "Penuh pertimbangan", "Lambat adaptasi", "Kaku dan keras kepala"], "career": "Directing, Managing or Supervising (in Engineering, Accountancy, Research and Development and Computing disciplines), Accountant, Project Engineer, Draughtsman, Designer, Analyst, Chemist, Technician, Service Engineer, Manager, Security Specialist.", "desc": "Seorang yang baik secara alamiah dan sangat berorientasi detil.  Ia peduli dengan orang-orang di sekitarnya dan mempunyai kualitas yang membuatnya sangat teliti dalam penyelesaian tugas.  Ia mempertimbangkan sekelilingnya dengan hati-hati sebelum membuat keputusan untuk melihat pengaruhnya pada mereka; saat tertentu ia terlalu hati-hati.  Jika ia merasa seseorang memanfaatkan situasi, ia akan memperlambat kerjanya sehingga dapat mengamati apa yang sedang berlangsung di sekitarnya."}, {"idx": 35, "name": "ADVOCATE", "traits": ["Stabil", "Ramah", "Detail ketika situasi membutuhkan", "Cenderung individualis", "Teguh pendirian", "Menyukai hubungan dengan orang", "Mendukung pihak yang lemah", "Ingin diterima sebagai anggota tim", "Ingin orang lain menyukainya", "Sulit membuat keputusan", "Moderat", "Cermat dan dapat diandalkan"], "career": "Personnel Welfare, Administrator, Advisers, Training, Teaching, Attorney, Accounting, Counseling, Technical Instructor, Customer Service, Accounting-General, Public Relations, Accounts Supervisor, Artist, Hotelier, Demonstrator, Engineer (Sales, Service, Project, Draughtsman, Designer), Specialist (Soft/Service), Selling, Purchasing, Sales Engineer, Legal, Negotiator, Student Service, Photographer, Physiotherapist, Project Engineer, Vocational Education, Supervising (Engineering, Production, Accounts) Administrative Work, Demonstrator, Secretarial, Hospitality Manager.", "desc": "Merupakan orang yang stabil, individu yang ramah yang berusaha keras membangun hubungan yang positif di tempat kerja dan di rumah.  Ia dapat menjadi sangat berorientasi detil ketika situasi membutuhkan; tetapi secara keseluruhan ia cenderung individualis, independen dan sedikit perhatian terhadap detil.  Sekali dia membuat keputusan, sangat sulit mengubah pendiriannya.  Ia menyukai hubungan dengan orang dan cenderung mendukung pihak yang lemah.  Ia akan mengambil posisi berlawanan dengan ketidaksepakatan dan merasa frustrasi jika sesuatu tidak sejalan dengannya.  Ia ingin diterima sebagai anggota tim, dan ia menginginkan orang lain menyukainya.  Ia cukup sulit membuat keputusan sampai parameter wewenang secara jelas ditentukan, dan ia mungkin cenderung tidak sungguh-sungguh jika dipaksa membuat keputusan ketika ia tidak ingin melakukannya.  Ia menginginkan orang lain yang membuat keputusan, khususnya jika ada orang yang sangat ia hargai dan hormati.  Ia cenderung moderat, cermat dan dapat diandalkan."}, {"idx": 36, "name": "ASSESSOR", "traits": ["Analitis", "Berwatak hati-hati", "Ramah pada saat merasa nyaman", "Sangat biasa dengan orang asing", "Mudah mengembangkan hubungan baru", "Dapat mengendalikan diri", "Peduli dan ramah", "Memusatkan perhatian pada penyelesaian tugas", "Perfeksionis secara alami", "Mengisolasi dirinya jika diperlukan", "Mudah diramalkan", "Berorientasi pada kualitas"], "career": "Sales (Technical/Specialist), Public Relations, Lecturer, Academic, Personnel Administration, Purchasing, Travel Agent, Training, Teaching, Real Estate Agent, Hospitality Administration, Sales-Technical, Hotelier, Project Engineer, Service Engineer.", "desc": "Merupakan seseorang yang analitis, berwatak hati-hati dan ramah pada saat merasa nyaman. Ia sangat biasa dengan orang asing, karena ia dapat menilai dan menyesuaikan diri dalam hubungan mereka. Ia dapat mengembangkan hubungan baru dengan mudah ketika ia ingin melakukannya, dan pada umumnya dapat mengendalikan diri sampai pada tingkat di mana ia jarang menimbulkan rasa benci pada orang lain dengan sengaja. Ia menampilkan sikap peduli dan ramah, namun mampu memusatkan perhatian pada penyelesaian tugas yang ada. Ia cenderung perfeksionis secara alami, dan akan mengisolasi dirinya jika diperlukan untuk melaksanakan pekerjaan. Ia suka berada pada situasi yang dapat diramalkan dan tidak ada kejutan. Ia sangat berorientasi pada kualitas dan akan bekerja dengan keras untuk menyelesaikan pekerjakan dengan benar. Ia ingin orang-orang berkenan akan pekerjaan yang sudah ia selesaikan dengan baik."}, {"idx": 37, "name": "CHALLENGER", "traits": ["Sangat berorientasi pada tugas", "Sensitif terhadap permasalahan", "Lebih mempedulikan tugas daripada orang", "Kukuh/keras", "Dingin", "Tidak berperasaan", "Menjaga jarak", "Membuat keputusan berdasarkan fakta", "Pendiam", "Tidak mudah percaya"], "career": "Directing, Managing or Supervising (Engineering, Research, Finance, Planning), Designer, Work Study, Sales (Technical/ Specialist), Logistic Support, Systems Analyst, Lecturer, Company Secretary, Negotiator and Purchasing.", "desc": "Seorang yang sangat berorientasi pada tugas dan sensitif pada permasalahan. Ia lebih mempedulikan tugas yang ada dibanding orang-orang di sekitarnya, termasuk perasaan mereka. Ia sangat kukuh/keras dan mempunyai pendekatan yang efektif dalam pemecahan masalah. Oleh karena sifat alamiah dan keinginannya akan hasil yang terukur, ia akan tampak dingin, tidak berperasaan dan menjaga jarak. Ia membuat keputusan berdasar pada fakta, bukan emosi. ia cenderung pendiam dan tidak mudah percaya."}, {"idx": 38, "name": "CONTEMPLATOR", "traits": ["Berorientasi pada hal-hal detil", "Mempunyai standar tinggi untuk dirinya", "Logis dan analitis", "Ingin berbuat yang terbaik", "Selalu berpikir ada ruang untuk kemajuan", "Kompetitif", "Ingin menghasilkan mutu yang terbaik", "Mampu mencapai sasarannya", "Sangat memusatkan perhatian pada tugas", "Mantap dan dapat diandalkan"], "career": "Engineering, Research, Production and Finance (Director, Manager atau Supervisor), Work Study, Accountant, Administrator, Quality Controller, Safety Officer, Market Analyst, Planner and Personnel (Director, Manager, Administrator), MIS Manager, Security Manager, Loss Control.", "desc": "Berorientasi pada hal detil dan mempunyai standard tinggi untuk dirinya. Ia logis dan analitis. Ia ingin berbuat yang terbaik, dan ia selalu berpikir ada ruang untuk peningkatan/kemajuan. Ia cenderung kompetitif dan ingin menghasilkan pekerjaan dengan mutu yang terbaik. Ia sebenarnya sensitif terhadap orang-orang, tetapi karena sifat logisnya, orientasinya terhadap tugas dapat menutupinya dengan mudah. Ia suka dihargai untuk pekerjaannya yang berkualitas. Ia mampu mengerjakan tugas-tugas; dan mencapai sasarannya. Ia sangat memusatkan perhatian pada tugas yang ada, mantap dan dapat diandalkan."}, {"idx": 39, "name": "ASSESSOR", "traits": ["Analitis", "Berwatak hati-hati", "Ramah pada saat merasa nyaman", "Sangat biasa dengan orang asing", "Mudah mengembangkan hubungan baru", "Dapat mengendalikan diri", "Peduli dan ramah", "Memusatkan perhatian pada penyelesaian tugas", "Perfeksionis secara alami", "Mengisolasi dirinya jika diperlukan", "Mudah diramalkan", "Berorientasi pada kualitas"], "career": "Directing, Managing or Supervising (Engineering, Research, Finance, Planning), Designer, Work Study, Sales (Technical/Specialist), Lecturer, Company Secretary, Negotiator and Purchasing.", "desc": "Merupakan seseorang yang analitis, berwatak hati-hati dan ramah pada saat merasa nyaman. Ia sangat biasa dengan orang asing, karena ia dapat menilai dan menyesuaikan diri dalam hubungan mereka. Ia dapat mengembangkan hubungan baru dengan mudah ketika ia ingin melakukannya, dan pada umumnya dapat mengendalikan diri sampai pada tingkat di mana ia jarang menimbulkan rasa benci pada orang lain dengan sengaja. Ia menampilkan sikap peduli dan ramah, namun mampu memusatkan perhatian pada penyelesaian tugas yang ada. Ia cenderung perfeksionis secara alami, dan akan mengisolasi dirinya jika diperlukan untuk melaksanakan pekerjaan. Ia suka berada pada situasi yang dapat diramalkan dan tidak ada kejutan. Ia sangat berorientasi pada kualitas dan akan bekerja dengan keras untuk menyelesaikan pekerjakan dengan benar. Ia ingin orang-orang berkenan akan pekerjaan yang sudah ia selesaikan dengan baik."}, {"idx": 40, "name": "PRECISIONIST", "traits": ["Sistematis dan Prosedural", "Teratur & memiliki perencanaan yang baik", "Teliti", "Fokus pada detil", "Bijaksana", "Diplomatis", "Jarang menentang rekan kerjanya", "Ia sangat berhati-hati", "Mengharapkan akurasi dan standard tinggi", "Menginginkan adanya petunjuk standard", "Tidak menginginkan perubahan mendadak"], "career": "Engineering, Research Director, Production and Finance (Director, Manager, Supervisor), Work Study, Accountant, Administrator, Quality Controller, Financial Services Manager, Safety Officer, Market Analyst, Planner and Personnel (Director, Manager, Administrator), MIS Manager, Electrician, Security Manager, Financial Researcher, Planner, Printer, Production Controller, Production Manager, Personnel Management, Loss Control.", "desc": "Berpikir sistematis dan cenderung mengikuti prosedur dalam kehidupan pribadi dan pekerjaannya.  Teratur dan memiliki perencanaan yang baik, ia teliti dan fokus pada detil.  Ia bertindak dengan penuh kebijaksanaan, diplomatis dan jarang menentang rekan kerjanya dengan sengaja.  Ia sangat berhati-hati, ia sungguh-sungguh mengharapkan akurasi dan standard tinggi dalam pekerjaannya.  Ia cenderung terjebak dalam hal detil, khususnya jika harus memutuskan.  ia menginginkan adanya petunjuk standard pelaksanaan kerja dan tanpa perubahan mendadak."}];

const PATTERN_MAP = {"C": 1, "D": 2, "D-I": 9, "D-I-S": 10, "D-S": 11, "S": 15, "S-C": 17, "D-C": 18, "D-I-C": 19, "D-S-I": 20, "D-S-C": 21, "D-C-I": 22, "D-C-S": 23, "I": 24, "I-S": 25, "I-C": 26, "I-C-D": 27, "I-C-S": 28, "S-D": 29, "S-I": 30, "S-D-I": 31, "S-I-D": 32, "S-I-C": 33, "S-C-D": 34, "S-C-I": 35, "C-I": 36, "C-D-I": 37, "C-D-S": 38, "C-I-D": 39, "C-S-D": 40, "C-D": 3, "I-D": 4, "I-D-C": 5, "I-D-S": 6, "I-S-D": 7, "S-D-C": 8, "C-I-S": 12, "C-S-I": 13, "I-S-C": 14, "C-S": 16};
// ============================================================
// REKOMENDASI TRAINING PER FAKTOR (disusun berdasarkan trait & karier
// yang sudah ada di sheet Def, diramu jadi rekomendasi pengembangan diri)
// ============================================================

const LETTER_LABEL = {
  D: 'D - Dominance (Dominan)',
  I: 'I - Influence (Pengaruh)',
  S: 'S - Steadiness (Stabil)',
  C: 'C - Conscientiousness (Teliti/Patuh Standar)'
};

const TRAINING_DATA = {
  D: {
    summary: 'Tegas, berorientasi hasil, suka tantangan, dan cepat mengambil keputusan.',
    growthArea: 'kesabaran, mendengarkan aktif, empati, dan delegasi.',
    trainings: [
      'Emotional Intelligence & Active Listening for Leaders',
      'Coaching & Delegation Skills',
      'Collaborative / Servant Leadership',
      'Managing Conflict with Empathy',
      'Strategic Patience & Change Leadership'
    ],
    tip: 'Bangun reputasi sebagai pemimpin yang menggerakkan lewat orang, bukan hanya lewat instruksi. Latih memberi ruang bagi ide tim sebelum memutuskan agar keputusan lebih kuat dan didukung penuh.'
  },
  I: {
    summary: 'Antusias, persuasif, komunikatif, dan cepat membangun relasi.',
    growthArea: 'perhatian pada detail, konsistensi, manajemen waktu, dan tindak lanjut (follow-through).',
    trainings: [
      'Time Management & Prioritization',
      'Project Management Fundamentals (Follow-Through)',
      'Analytical & Data-Driven Decision Making',
      'Deep Listening & Constructive Feedback',
      'Advanced Negotiation & Persuasion'
    ],
    tip: 'Pasangkan kekuatan membangun relasi dengan sistem pribadi (checklist, reminder, partner akuntabilitas) agar ide-ide besar benar-benar tuntas dieksekusi, bukan berhenti di tahap semangat awal.'
  },
  S: {
    summary: 'Sabar, loyal, suportif, konsisten, dan penjaga harmoni tim.',
    growthArea: 'adaptasi terhadap perubahan, asertivitas, inisiatif, dan kecepatan mengambil keputusan.',
    trainings: [
      'Change Management & Agility Mindset',
      'Assertive Communication',
      'Decision Making Under Ambiguity/Tekanan',
      'Personal Branding & Visibility di Organisasi',
      'Leadership Foundations / Ready-to-Lead Program'
    ],
    tip: 'Jangan hanya menjadi "pendukung yang bisa diandalkan" - mulai ambil peran yang lebih terlihat (presentasi, memimpin proyek kecil) agar kontribusi lebih dikenal saat kesempatan promosi terbuka.'
  },
  C: {
    summary: 'Analitis, teliti, sistematis, dan berstandar tinggi berbasis fakta & data.',
    growthArea: 'fleksibilitas, komunikasi interpersonal, keberanian mengambil risiko, dan melihat gambaran besar.',
    trainings: [
      'Agile Mindset & Adaptability',
      'Interpersonal Communication & Empathy at Work',
      'Decisive Action & Risk-Taking for Analysts',
      'Storytelling & Presentation with Data',
      'Progress over Perfection: Managing Perfectionism'
    ],
    tip: 'Latih menyampaikan hasil analisis dengan cerita yang mudah dicerna audiens non-teknis, dan beranilah mengambil keputusan dengan data 80% lengkap alih-alih menunggu kesempurnaan 100%.'
  }
};

function buildTrainingRecommendation_(order) {
  const primary = order[0];
  const secondary = order[1];
  const p = TRAINING_DATA[primary];
  const s = TRAINING_DATA[secondary];
  const trainings = p.trainings.slice(0, 3).concat(s.trainings.slice(0, 2));
  return {
    primaryLetter: primary,
    secondaryLetter: secondary,
    summary: p.summary,
    growthArea: p.growthArea + ' Sebagai faktor pendukung, perhatikan juga ' + s.growthArea,
    trainings: trainings,
    tip: p.tip + ' ' + s.tip
  };
}

// ============================================================
// SHEET HELPERS
// ============================================================

function getSpreadsheet_() {
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('Script ini tidak terpasang pada Google Sheet dan SPREADSHEET_ID belum diset di Script Properties.');
  }
  return SpreadsheetApp.openById(id);
}

function getSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(SHEET_HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ============================================================
// WEB APP ENTRY POINT
// ============================================================

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('DISC Assessment Tools')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ============================================================
// QUESTIONS FOR CLIENT (tanpa mapping D/I/S/C supaya tidak bisa dibaca dari sisi client)
// ============================================================

function getQuestionsForClient() {
  return QUESTIONS.map(function (q) {
    return {
      no: q.no,
      statements: q.statements.map(function (s) { return s.text; })
    };
  });
}

// ============================================================
// SCORING ENGINE
// ============================================================

function scoreAnswers_(answers) {
  if (!Array.isArray(answers) || answers.length !== 24) {
    throw new Error('Jawaban tidak lengkap. Harus 24 soal.');
  }
  const byNo = {};
  answers.forEach(function (a) { byNo[a.no] = a; });

  const most = { D: 0, I: 0, S: 0, C: 0 };
  const least = { D: 0, I: 0, S: 0, C: 0 };

  QUESTIONS.forEach(function (q) {
    const a = byNo[q.no];
    if (!a) throw new Error('Jawaban soal nomor ' + q.no + ' tidak ditemukan.');
    const mostPos = Number(a.mostPos);
    const leastPos = Number(a.leastPos);
    if (![1, 2, 3, 4].includes(mostPos) || ![1, 2, 3, 4].includes(leastPos)) {
      throw new Error('Jawaban soal nomor ' + q.no + ' tidak valid.');
    }
    if (mostPos === leastPos) {
      throw new Error('Soal nomor ' + q.no + ': pilihan "Paling menggambarkan" dan "Paling tidak menggambarkan" tidak boleh sama.');
    }
    const mostLetter = q.statements[mostPos - 1].most;
    const leastLetter = q.statements[leastPos - 1].least;
    if (mostLetter !== '*') most[mostLetter] += 1;
    if (leastLetter !== '*') least[leastLetter] += 1;
  });

  const result = {
    D: most.D - least.D,
    I: most.I - least.I,
    S: most.S - least.S,
    C: most.C - least.C
  };

  const order = ['D', 'I', 'S', 'C'].sort(function (a, b) {
    if (result[b] !== result[a]) return result[b] - result[a];
    return ['D', 'I', 'S', 'C'].indexOf(a) - ['D', 'I', 'S', 'C'].indexOf(b);
  });

  const code = order.slice(0, 3).join('-');
  const idx = PATTERN_MAP[code];
  const defEntry = DEF_ENTRIES.filter(function (d) { return d.idx === idx; })[0];

  return { most: most, least: least, result: result, order: order, code: code, defEntry: defEntry };
}

// ============================================================
// SUBMIT TEST
// ============================================================

function submitTest(payload) {
  if (!payload || !payload.participant || !payload.answers) {
    throw new Error('Data tidak lengkap.');
  }
  const p = payload.participant;
  if (!p.nama || !p.email || !p.usia || !p.jenisKelamin) {
    throw new Error('Nama, email, usia, dan jenis kelamin wajib diisi.');
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(p.email)) {
    throw new Error('Format email tidak valid.');
  }

  const scoring = scoreAnswers_(payload.answers);
  const training = buildTrainingRecommendation_(scoring.order);
  const responseId = Utilities.getUuid();
  const timestamp = new Date();

  let emailSent = false;
  try {
    sendResultEmail_(p, scoring, training, timestamp);
    emailSent = true;
  } catch (err) {
    emailSent = false;
  }

  const sheet = getSheet_();
  sheet.appendRow([
    timestamp, responseId, p.nama, p.email, p.usia, p.jenisKelamin, p.jabatan || '',
    scoring.most.D, scoring.most.I, scoring.most.S, scoring.most.C,
    scoring.least.D, scoring.least.I, scoring.least.S, scoring.least.C,
    scoring.result.D, scoring.result.I, scoring.result.S, scoring.result.C,
    scoring.code, scoring.defEntry ? scoring.defEntry.name : '', emailSent ? 'Ya' : 'Tidak'
  ]);

  return {
    responseId: responseId,
    participant: p,
    scoring: scoring,
    training: training,
    emailSent: emailSent
  };
}

// ============================================================
// CHART (untuk email)
// ============================================================

function buildChartBlob_(scoring) {
  const dataTable = Charts.newDataTable()
    .addColumn(Charts.ColumnType.STRING, 'Faktor')
    .addColumn(Charts.ColumnType.NUMBER, 'Paling (Most)')
    .addColumn(Charts.ColumnType.NUMBER, 'Paling Tidak (Least)')
    .addColumn(Charts.ColumnType.NUMBER, 'Hasil (Result)');

  ['D', 'I', 'S', 'C'].forEach(function (letter) {
    dataTable.addRow([letter, scoring.most[letter], scoring.least[letter], scoring.result[letter]]);
  });

  const chart = Charts.newColumnChart()
    .setDataTable(dataTable)
    .setDimensions(560, 300)
    .setTitle('Grafik DISC')
    .setColors(['#93c5fd', '#fca5a5', '#2563eb'])
    .setOption('legend', { position: 'top' })
    .build();

  return chart.getAs('image/png').setName('disc-chart.png');
}

// ============================================================
// EMAIL
// ============================================================

function buildResultEmailHtml_(participant, scoring, training) {
  const def = scoring.defEntry;
  const letterRows = ['D', 'I', 'S', 'C'].map(function (letter) {
    return '<tr>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;font-weight:600;">' + LETTER_LABEL[letter] + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">' + scoring.most[letter] + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;">' + scoring.least[letter] + '</td>' +
      '<td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:center;font-weight:700;color:#2563eb;">' + scoring.result[letter] + '</td>' +
      '</tr>';
  }).join('');

  const trainingList = training.trainings.map(function (t) { return '<li style="margin-bottom:4px;">' + t + '</li>'; }).join('');

  return '' +
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">' +
    '<div style="background:#2563eb;padding:20px 24px;border-radius:8px 8px 0 0;">' +
    '<h1 style="color:#fff;margin:0;font-size:20px;">Hasil Tes DISC Anda</h1>' +
    '</div>' +
    '<div style="border:1px solid #e5e7eb;border-top:none;padding:24px;border-radius:0 0 8px 8px;">' +
    '<p>Halo <b>' + participant.nama + '</b>,</p>' +
    '<p>Berikut hasil Tes Kepribadian DISC Anda:</p>' +
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">' +
    '<tr style="background:#f3f4f6;"><th style="padding:6px 10px;text-align:left;">Faktor</th><th style="padding:6px 10px;">Paling</th><th style="padding:6px 10px;">Paling Tidak</th><th style="padding:6px 10px;">Hasil</th></tr>' +
    letterRows +
    '</table>' +
    '<img src="cid:disc-chart" style="max-width:100%;margin:8px 0 20px;" alt="Grafik DISC" />' +
    '<div style="background:#eff6ff;border-left:4px solid #2563eb;padding:14px 18px;border-radius:4px;margin-bottom:20px;">' +
    '<p style="margin:0 0 4px;font-size:13px;color:#2563eb;font-weight:700;letter-spacing:.03em;">TIPE KEPRIBADIAN ANDA</p>' +
    '<p style="margin:0;font-size:22px;font-weight:700;">' + (def ? def.name : '-') + ' (' + scoring.code + ')</p>' +
    '</div>' +
    '<p>' + (def ? def.desc : '') + '</p>' +
    '<h3 style="margin-bottom:8px;">Rekomendasi Training untuk Mendukung Karier Anda</h3>' +
    '<ul style="padding-left:20px;margin-top:0;">' + trainingList + '</ul>' +
    '<p>' + training.tip + '</p>' +
    '<h3 style="margin-bottom:8px;">Area Karier yang Cocok</h3>' +
    '<p style="font-size:13px;color:#4b5563;">' + (def ? def.career : '') + '</p>' +
    '<p style="margin-top:24px;font-size:12px;color:#9ca3af;">Email ini dikirim otomatis oleh DISC Assessment Tools.</p>' +
    '</div>' +
    '</div>';
}

function sendResultEmail_(participant, scoring, training) {
  const chartBlob = buildChartBlob_(scoring);
  const html = buildResultEmailHtml_(participant, scoring, training);
  const props = PropertiesService.getScriptProperties();
  const adminCc = props.getProperty('ADMIN_CC_EMAIL') || '';

  const options = {
    htmlBody: html,
    inlineImages: { 'disc-chart': chartBlob },
    name: 'DISC Assessment Tools'
  };
  if (adminCc) options.cc = adminCc;

  MailApp.sendEmail(participant.email, 'Hasil Tes DISC - ' + participant.nama, 'Hasil tes DISC Anda (versi HTML) terlampir.', options);
}

// ============================================================
// ADMIN
// ============================================================

function ensureAdminPasswordDefault_() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ADMIN_PASSWORD')) {
    props.setProperty('ADMIN_PASSWORD', DEFAULT_ADMIN_PASSWORD);
  }
}

function adminLogin(password) {
  ensureAdminPasswordDefault_();
  const props = PropertiesService.getScriptProperties();
  const real = props.getProperty('ADMIN_PASSWORD');
  if (password !== real) {
    return { ok: false, message: 'Password salah.' };
  }
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('admin_' + token, 'valid', ADMIN_TOKEN_TTL_SECONDS);
  return { ok: true, token: token };
}

function validateAdminToken_(token) {
  if (!token) return false;
  return CacheService.getScriptCache().get('admin_' + token) === 'valid';
}

function adminGetResponses(token) {
  if (!validateAdminToken_(token)) {
    throw new Error('Sesi admin tidak valid. Silakan login ulang.');
  }
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS.length).getValues();
  return values.map(function (row) {
    const obj = {};
    SHEET_HEADERS.forEach(function (h, i) { obj[h] = row[i]; });
    obj.Timestamp = Utilities.formatDate(new Date(obj.Timestamp), Session.getScriptTimeZone() || 'GMT+7', 'yyyy-MM-dd HH:mm');
    return obj;
  });
}

function adminResendEmail(token, responseId) {
  if (!validateAdminToken_(token)) {
    throw new Error('Sesi admin tidak valid. Silakan login ulang.');
  }
  const sheet = getSheet_();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) throw new Error('Data tidak ditemukan.');
  const values = sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS.length).getValues();
  const idIdx = SHEET_HEADERS.indexOf('ResponseId');
  const rowIndex = values.findIndex(function (row) { return row[idIdx] === responseId; });
  if (rowIndex === -1) throw new Error('Data peserta tidak ditemukan.');

  const row = values[rowIndex];
  const get = function (name) { return row[SHEET_HEADERS.indexOf(name)]; };

  const participant = { nama: get('Nama'), email: get('Email'), usia: get('Usia'), jenisKelamin: get('JenisKelamin'), jabatan: get('Jabatan') };
  const most = { D: get('Most_D'), I: get('Most_I'), S: get('Most_S'), C: get('Most_C') };
  const least = { D: get('Least_D'), I: get('Least_I'), S: get('Least_S'), C: get('Least_C') };
  const result = { D: get('Result_D'), I: get('Result_I'), S: get('Result_S'), C: get('Result_C') };
  const order = ['D', 'I', 'S', 'C'].sort(function (a, b) { return result[b] - result[a]; });
  const code = order.slice(0, 3).join('-');
  const idx = PATTERN_MAP[code];
  const defEntry = DEF_ENTRIES.filter(function (d) { return d.idx === idx; })[0];
  const scoring = { most: most, least: least, result: result, order: order, code: code, defEntry: defEntry };
  const training = buildTrainingRecommendation_(order);

  sendResultEmail_(participant, scoring, training);

  const sheetRowNum = rowIndex + 2;
  sheet.getRange(sheetRowNum, SHEET_HEADERS.indexOf('EmailTerkirim') + 1).setValue('Ya');

  return { ok: true };
}

function adminGetSummary(token) {
  if (!validateAdminToken_(token)) {
    throw new Error('Sesi admin tidak valid. Silakan login ulang.');
  }
  const rows = adminGetResponses(token);
  const counts = {};
  rows.forEach(function (r) {
    const key = r.KodeTipe || '-';
    counts[key] = (counts[key] || 0) + 1;
  });
  return { total: rows.length, byType: counts };
}
