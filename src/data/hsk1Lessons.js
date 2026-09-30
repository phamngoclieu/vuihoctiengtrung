import { lessonOne } from './lesson1.js'

const audioRoot = (lessonNumber) => `${import.meta.env.BASE_URL}audio/hsk1/lesson-${String(lessonNumber).padStart(2, '0')}`

const word = ([hanzi, pinyin, meaningVi, meaningEn, partOfSpeech = 'từ vựng'], index, lessonNumber) => ({
  id: `w-${String(index + 1).padStart(2, '0')}`,
  hanzi,
  pinyin,
  meaningVi,
  meaningEn,
  partOfSpeech,
  source: `PPT Bài ${lessonNumber} · Từ mới`,
  examples: [],
})

const line = (speaker, zh, py, vi, en) => ({ speaker, zh, py, vi, en })

const lessonSpecs = [
  {
    number: 2,
    title: '我叫李文', pinyin: 'Wǒ jiào Lǐ Wén', titleVi: 'Tôi tên là Lý Văn', titleEn: 'My name is Li Wen',
    objectives: ['Tự giới thiệu và hỏi tên người khác.', 'Xin lỗi và đáp lời xin lỗi.', 'Nắm trật tự câu cơ bản và cấu trúc tên tiếng Trung.'],
    vocabulary: [
      ['请问', 'qǐngwèn', 'xin hỏi; cho tôi hỏi', 'excuse me; may I ask', 'công thức lịch sự'], ['你', 'nǐ', 'bạn', 'you', 'đại từ'], ['叫', 'jiào', 'tên là; gọi', 'to be called; to call', 'động từ'], ['什么', 'shénme', 'gì', 'what', 'đại từ nghi vấn'], ['名字', 'míngzi', 'tên', 'name', 'danh từ'], ['我', 'wǒ', 'tôi', 'I; me', 'đại từ'], ['不', 'bù', 'không', 'not', 'phó từ'], ['是', 'shì', 'là', 'to be', 'động từ'], ['对不起', 'duìbuqǐ', 'xin lỗi', 'sorry', 'công thức giao tiếp'], ['没关系', 'méi guānxi', 'không sao', 'it does not matter', 'công thức giao tiếp'], ['没事', 'méishì', 'không sao; không có việc gì', 'it is fine; nothing', 'công thức giao tiếp'], ['很', 'hěn', 'rất', 'very', 'phó từ'], ['高兴', 'gāoxìng', 'vui mừng', 'happy; glad', 'tính từ'], ['认识', 'rènshi', 'quen biết; làm quen', 'to know; to meet', 'động từ'], ['也', 'yě', 'cũng', 'also', 'phó từ'],
    ],
    grammar: [
      ['Trật tự câu cơ bản', 'Basic sentence order', '基本语序', 'Câu trần thuật cơ bản theo trật tự Chủ ngữ + Động từ + Tân ngữ.', 'A basic statement follows Subject + Verb + Object.', ['你叫什么名字？', '我叫白家月。']],
      ['Câu chữ “是”', 'Sentences with 是', '“是”字句', 'Dùng “是” để nối chủ ngữ với danh từ chỉ thân phận hoặc phân loại.', 'Use 是 to link a subject with an identity or category.', ['我是学生。', '我不是老师。']],
    ],
    dialogues: [
      ['Làm quen', 'Getting acquainted', [line('A', '请问，你叫什么名字？', 'Qǐngwèn, nǐ jiào shénme míngzi?', 'Xin hỏi, bạn tên là gì?', 'Excuse me, what is your name?'), line('B', '我叫李文。', 'Wǒ jiào Lǐ Wén.', 'Tôi tên là Lý Văn.', 'My name is Li Wen.')]],
      ['Xin lỗi', 'Apologising', [line('A', '对不起。', 'Duìbuqǐ.', 'Xin lỗi.', 'Sorry.'), line('B', '没关系。', 'Méi guānxi.', 'Không sao.', 'It does not matter.')]],
      ['Rất vui được gặp bạn', 'Nice to meet you', [line('A', '很高兴认识你。', 'Hěn gāoxìng rènshi nǐ.', 'Rất vui được làm quen với bạn.', 'Nice to meet you.'), line('B', '我也很高兴。', 'Wǒ yě hěn gāoxìng.', 'Tôi cũng rất vui.', 'I am glad too.')]],
    ],
    tongueTwister: [line('', '七加一，再减一，加完减完等于几？', 'Qī jiā yī, zài jiǎn yī, jiāwán jiǎnwán děngyú jǐ?', 'Bảy cộng một, rồi trừ một, cộng trừ xong bằng mấy?', 'Seven plus one, then minus one—what is the result?'), line('', '加完减完还是七。', 'Jiāwán jiǎnwán háishi qī.', 'Cộng trừ xong vẫn là bảy.', 'After adding and subtracting, it is still seven.')],
  },
  {
    number: 3,
    title: '我是中国人', pinyin: 'Wǒ shì Zhōngguó rén', titleVi: 'Tôi là người Trung Quốc', titleEn: 'I am Chinese',
    objectives: ['Giới thiệu quốc tịch và nghề nghiệp.', 'Dùng trợ từ kết cấu “的”.', 'Đặt câu hỏi đúng–sai với “吗”.'],
    vocabulary: [
      ['人', 'rén', 'người', 'person', 'danh từ'], ['的', 'de', 'trợ từ kết cấu đứng sau thành phần bổ nghĩa', 'structural particle after a modifier', 'trợ từ'], ['中国', 'Zhōngguó', 'Trung Quốc', 'China', 'danh từ riêng'], ['法国', 'Fǎguó', 'Pháp', 'France', 'danh từ riêng'], ['中文', 'Zhōngwén', 'tiếng Trung', 'Chinese language', 'danh từ'], ['她', 'tā', 'cô ấy', 'she; her', 'đại từ'], ['这', 'zhè', 'đây; này', 'this', 'đại từ'], ['谁', 'shéi', 'ai', 'who', 'đại từ nghi vấn'], ['女朋友', 'nǚpéngyou', 'bạn gái', 'girlfriend', 'danh từ'], ['哪', 'nǎ', 'nào', 'which', 'đại từ nghi vấn'], ['国', 'guó', 'nước; quốc gia', 'country', 'danh từ'], ['泰国', 'Tàiguó', 'Thái Lan', 'Thailand', 'danh từ riêng'], ['喂', 'wèi', 'a-lô; này', 'hello on the phone; hey', 'thán từ'], ['姐姐', 'jiějie', 'chị gái', 'older sister', 'danh từ'], ['工作', 'gōngzuò', 'công việc; làm việc', 'work; to work', 'danh từ / động từ'], ['还', 'hái', 'vẫn; còn', 'still; also', 'phó từ'], ['忙', 'máng', 'bận', 'busy', 'tính từ'], ['吗', 'ma', 'trợ từ nghi vấn', 'question particle', 'trợ từ'], ['对', 'duì', 'đúng', 'correct; right', 'tính từ'], ['太', 'tài', 'quá', 'too; extremely', 'phó từ'], ['我们', 'wǒmen', 'chúng tôi; chúng ta', 'we; us', 'đại từ'], ['想', 'xiǎng', 'nhớ; muốn', 'to miss; to want', 'động từ'],
    ],
    grammar: [
      ['Câu chữ “是”', 'Sentences with 是', '“是”字句', 'Dùng “是” để giới thiệu quốc tịch, nghề nghiệp hoặc thân phận; phủ định bằng “不是”.', 'Use 是 for nationality, occupation, or identity; negate it with 不是.', ['我是法国人。', '她是中文老师。', '我老师不是法国人。']],
      ['Trợ từ kết cấu “的”', 'The structural particle 的', '结构助词“的”', '“的” nối thành phần sở hữu hoặc bổ nghĩa với danh từ trung tâm.', '的 links a possessor or modifier to the head noun.', ['白家月的中文老师', '你的名字']],
      ['Câu hỏi với “吗”', 'Questions with 吗', '“吗”字问句', 'Thêm “吗” ở cuối câu trần thuật để tạo câu hỏi đúng–sai.', 'Add 吗 to a statement to form a yes-or-no question.', ['你也很忙吗？', '你是他的中文老师吗？']],
    ],
    dialogues: [
      ['Quốc tịch', 'Nationality', [line('A', '你是哪国人？', 'Nǐ shì nǎ guó rén?', 'Bạn là người nước nào?', 'Which country are you from?'), line('B', '我是中国人。', 'Wǒ shì Zhōngguó rén.', 'Tôi là người Trung Quốc.', 'I am Chinese.')]],
      ['Giới thiệu giáo viên', 'Introducing a teacher', [line('A', '这是谁？', 'Zhè shì shéi?', 'Đây là ai?', 'Who is this?'), line('B', '她是我的中文老师。', 'Tā shì wǒ de Zhōngwén lǎoshī.', 'Cô ấy là giáo viên tiếng Trung của tôi.', 'She is my Chinese teacher.')]],
      ['Hỏi thăm công việc', 'Asking about work', [line('A', '你姐姐还忙吗？', 'Nǐ jiějie hái máng ma?', 'Chị bạn vẫn bận à?', 'Is your older sister still busy?'), line('B', '对，她太忙了。', 'Duì, tā tài máng le.', 'Đúng, chị ấy bận quá.', 'Yes, she is very busy.')]],
    ],
    tongueTwister: [line('', '四是四，十是十。', 'Sì shì sì, shí shì shí.', 'Bốn là bốn, mười là mười.', 'Four is four, ten is ten.'), line('', '十四是十四，四十是四十。', 'Shísì shì shísì, sìshí shì sìshí.', 'Mười bốn là mười bốn, bốn mươi là bốn mươi.', 'Fourteen is fourteen, forty is forty.')],
  },
  {
    number: 4,
    title: '我有两个孩子', pinyin: 'Wǒ yǒu liǎng ge háizi', titleVi: 'Tôi có hai người con', titleEn: 'I have two children',
    objectives: ['Nói về gia đình bằng câu chữ “有”.', 'Dùng mẫu “A……，B呢？”.', 'Dùng số từ, lượng từ và hỏi tuổi.'],
    vocabulary: [
      ['有', 'yǒu', 'có', 'to have', 'động từ'], ['多少', 'duōshao', 'bao nhiêu', 'how many; how much', 'đại từ nghi vấn'], ['个', 'ge', 'lượng từ thông dụng', 'general measure word', 'lượng từ'], ['哥哥', 'gēge', 'anh trai', 'older brother', 'danh từ'], ['呢', 'ne', 'thế còn…; trợ từ', 'and what about; particle', 'trợ từ'], ['没有', 'méiyǒu', 'không có', 'not have; there is not', 'động từ'], ['家', 'jiā', 'gia đình; nhà', 'family; home', 'danh từ'], ['几', 'jǐ', 'mấy; bao nhiêu', 'how many; several', 'đại từ nghi vấn'], ['口', 'kǒu', 'lượng từ chỉ người trong gia đình', 'measure word for family members', 'lượng từ'], ['爸爸', 'bàba', 'bố', 'father', 'danh từ'], ['妈妈', 'māma', 'mẹ', 'mother', 'danh từ'], ['妹妹', 'mèimei', 'em gái', 'younger sister', 'danh từ'], ['和', 'hé', 'và', 'and', 'liên từ'], ['儿子', 'érzi', 'con trai', 'son', 'danh từ'], ['孩子', 'háizi', 'con; trẻ em', 'child', 'danh từ'], ['女儿', 'nǚ’ér', 'con gái', 'daughter', 'danh từ'], ['岁', 'suì', 'tuổi', 'years old', 'lượng từ'], ['他', 'tā', 'anh ấy; ông ấy', 'he; him', 'đại từ'], ['今年', 'jīnnián', 'năm nay', 'this year', 'danh từ thời gian'], ['多', 'duō', 'bao nhiêu; nhiều', 'how; many', 'đại từ / tính từ'], ['大', 'dà', 'lớn; bao nhiêu tuổi', 'big; old', 'tính từ'],
    ],
    grammar: [
      ['Câu chữ “有”', 'Sentences with 有', '“有”字句', 'Dùng “有” để biểu thị sở hữu; phủ định bằng “没有”.', 'Use 有 for possession; negate it with 没有.', ['她有一个姐姐。', '我没有姐姐。']],
      ['Mẫu “A……，B呢？”', 'The A…, B呢? pattern', '“A……，B呢？”', 'Sau khi nói về A, dùng “B呢？” để hỏi về B trong cùng chủ đề.', 'After discussing A, use B呢? to ask about B on the same topic.', ['我有两个哥哥，你呢？']],
      ['Số từ và lượng từ', 'Numerals and measure words', '数词和量词', 'Số từ đứng trước lượng từ rồi mới đến danh từ.', 'A numeral comes before a measure word and then a noun.', ['四口人', '两个哥哥', '他今年几岁？']],
    ],
    dialogues: [
      ['Gia đình', 'Family', [line('A', '你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'Nhà bạn có mấy người?', 'How many people are in your family?'), line('B', '我家有四口人。', 'Wǒ jiā yǒu sì kǒu rén.', 'Nhà tôi có bốn người.', 'There are four people in my family.')]],
      ['Anh chị em', 'Siblings', [line('A', '我有两个哥哥，你呢？', 'Wǒ yǒu liǎng ge gēge, nǐ ne?', 'Tôi có hai anh trai, còn bạn?', 'I have two older brothers. What about you?'), line('B', '我没有哥哥。', 'Wǒ méiyǒu gēge.', 'Tôi không có anh trai.', 'I do not have an older brother.')]],
      ['Hỏi tuổi', 'Asking age', [line('A', '你儿子今年多大？', 'Nǐ érzi jīnnián duō dà?', 'Con trai bạn năm nay bao nhiêu tuổi?', 'How old is your son this year?'), line('B', '他今年五岁。', 'Tā jīnnián wǔ suì.', 'Năm nay cháu năm tuổi.', 'He is five this year.')]],
    ],
  },
  {
    number: 5,
    title: '今天我休息', pinyin: 'Jīntiān wǒ xiūxi', titleVi: 'Hôm nay tôi nghỉ', titleEn: 'I am off today',
    objectives: ['Nói ngày tháng và thứ trong tuần.', 'Dùng động từ năng nguyện “会”.', 'Hiểu câu vị ngữ danh từ.'],
    vocabulary: [
      ['今天', 'jīntiān', 'hôm nay', 'today', 'danh từ thời gian'], ['号', 'hào', 'ngày; số', 'date; number', 'danh từ'], ['月', 'yuè', 'tháng', 'month', 'danh từ'], ['日', 'rì', 'ngày', 'day; date', 'danh từ'], ['星期', 'xīngqī', 'tuần; thứ', 'week; weekday', 'danh từ'], ['星期日', 'Xīngqīrì', 'Chủ nhật', 'Sunday', 'danh từ'], ['星期天', 'Xīngqītiān', 'Chủ nhật', 'Sunday', 'danh từ'], ['休息', 'xiūxi', 'nghỉ ngơi', 'to rest', 'động từ'], ['会', 'huì', 'biết; có thể do học được', 'can; know how to', 'động từ năng nguyện'], ['做饭', 'zuòfàn', 'nấu ăn', 'to cook', 'động từ'], ['做', 'zuò', 'làm', 'to do; to make', 'động từ'], ['面条儿', 'miàntiáor', 'mì sợi', 'noodles', 'danh từ'], ['饺子', 'jiǎozi', 'sủi cảo', 'dumplings', 'danh từ'], ['一些', 'yìxiē', 'một ít; một số', 'some', 'số lượng từ'], ['菜', 'cài', 'món ăn; rau', 'dish; vegetable', 'danh từ'], ['下班', 'xiàbān', 'tan làm', 'to get off work', 'động từ'], ['新', 'xīn', 'mới', 'new', 'tính từ'], ['电脑', 'diànnǎo', 'máy tính', 'computer', 'danh từ'], ['真', 'zhēn', 'thật; thực sự', 'really', 'phó từ'], ['好看', 'hǎokàn', 'đẹp; dễ nhìn', 'good-looking', 'tính từ'], ['喜欢', 'xǐhuan', 'thích', 'to like', 'động từ'], ['它', 'tā', 'nó', 'it', 'đại từ'],
    ],
    grammar: [
      ['Ngày tháng', 'Dates', '日期表达', 'Thứ tự nói ngày tháng là năm, tháng, ngày; dùng “号” trong khẩu ngữ.', 'Dates are stated as year, month, and day; 号 is common in speech.', ['今天几号？', '今天五月一号。']],
      ['Câu vị ngữ danh từ', 'Nominal-predicate sentences', '名词谓语句', 'Danh từ hoặc cụm danh từ có thể làm vị ngữ khi nói tuổi, ngày tháng hoặc số lượng.', 'A noun phrase can be the predicate for age, dates, or quantities.', ['我妹妹十二岁。']],
      ['Động từ năng nguyện “会”', 'The modal verb 会', '能愿动词“会”', '“会” đặt trước động từ để nói năng lực có được qua học tập.', '会 comes before a verb to express an acquired skill.', ['你会做饭吗？', '我会做面条儿。', '我不会做菜。']],
    ],
    dialogues: [
      ['Ngày nghỉ', 'A day off', [line('A', '今天几号？', 'Jīntiān jǐ hào?', 'Hôm nay ngày mấy?', 'What is the date today?'), line('B', '今天五月一号，我休息。', 'Jīntiān wǔ yuè yī hào, wǒ xiūxi.', 'Hôm nay là ngày 1 tháng 5, tôi nghỉ.', 'Today is May 1, and I am off.')]],
      ['Nấu ăn', 'Cooking', [line('A', '你会做饭吗？', 'Nǐ huì zuòfàn ma?', 'Bạn biết nấu ăn không?', 'Can you cook?'), line('B', '我会做面条儿。', 'Wǒ huì zuò miàntiáor.', 'Tôi biết làm mì.', 'I can make noodles.')]],
      ['Máy tính mới', 'A new computer', [line('A', '你的新电脑真好看！', 'Nǐ de xīn diànnǎo zhēn hǎokàn!', 'Máy tính mới của bạn thật đẹp!', 'Your new computer looks great!'), line('B', '我很喜欢它。', 'Wǒ hěn xǐhuan tā.', 'Tôi rất thích nó.', 'I like it very much.')]],
    ],
  },
  {
    number: 6,
    title: '你的手机号是多少？', pinyin: 'Nǐ de shǒujī hào shì duōshao?', titleVi: 'Số điện thoại di động của bạn là bao nhiêu?', titleEn: 'What is your mobile number?',
    objectives: ['Hỏi và đọc số điện thoại.', 'Dùng câu liên động để nói mục đích và cách thức.', 'Dùng “想” và “怎么”.'],
    vocabulary: [
      ['手机', 'shǒujī', 'điện thoại di động', 'mobile phone', 'danh từ'], ['电话', 'diànhuà', 'điện thoại; cuộc gọi', 'telephone; phone call', 'danh từ'], ['号', 'hào', 'số', 'number', 'danh từ'], ['明天', 'míngtiān', 'ngày mai', 'tomorrow', 'danh từ thời gian'], ['去', 'qù', 'đi', 'to go', 'động từ'], ['哪儿', 'nǎr', 'đâu; nơi nào', 'where', 'đại từ nghi vấn'], ['想', 'xiǎng', 'muốn', 'to want', 'động từ năng nguyện'], ['超市', 'chāoshì', 'siêu thị', 'supermarket', 'danh từ'], ['买', 'mǎi', 'mua', 'to buy', 'động từ'], ['东西', 'dōngxi', 'đồ; vật; thứ', 'thing; stuff', 'danh từ'], ['些', 'xiē', 'một ít; một số', 'some', 'lượng từ'], ['牛奶', 'niúnǎi', 'sữa bò', 'milk', 'danh từ'], ['吃', 'chī', 'ăn', 'to eat', 'động từ'], ['晚饭', 'wǎnfàn', 'bữa tối', 'dinner', 'danh từ'], ['那边', 'nàbiān', 'phía bên kia; đằng kia', 'over there', 'đại từ nơi chốn'], ['包子', 'bāozi', 'bánh bao', 'steamed bun', 'danh từ'], ['非常', 'fēicháng', 'vô cùng; rất', 'very; extremely', 'phó từ'], ['好吃', 'hǎochī', 'ngon', 'delicious', 'tính từ'], ['米饭', 'mǐfàn', 'cơm trắng', 'cooked rice', 'danh từ'], ['怎么', 'zěnme', 'thế nào; bằng cách nào', 'how', 'đại từ nghi vấn'], ['坐', 'zuò', 'đi bằng; ngồi', 'to take; to sit', 'động từ'], ['出租车', 'chūzūchē', 'taxi', 'taxi', 'danh từ'], ['西安饭店', 'Xī’ān Fàndiàn', 'Nhà hàng Tây An', "Xi'an Restaurant", 'danh từ riêng'],
    ],
    grammar: [
      ['Động từ năng nguyện “想”', 'The modal verb 想', '能愿动词“想”', '“想” đứng trước động từ để biểu thị mong muốn.', '想 comes before a verb to express a wish or intention.', ['我想去超市。']],
      ['Câu liên động', 'Serial-verb sentences', '连动句', 'Hai động từ nối tiếp có thể biểu thị phương thức và mục đích.', 'Consecutive verbs can express a method followed by a purpose.', ['我们坐出租车去西安饭店。']],
      ['Hỏi cách thức với “怎么”', 'Asking how with 怎么', '疑问代词“怎么”', '“怎么” đứng trước động từ để hỏi cách thực hiện.', '怎么 comes before a verb to ask how something is done.', ['我们怎么去？']],
    ],
    dialogues: [
      ['Số điện thoại', 'Phone number', [line('A', '你的手机号是多少？', 'Nǐ de shǒujī hào shì duōshao?', 'Số điện thoại di động của bạn là bao nhiêu?', 'What is your mobile number?'), line('B', '我的手机号是……', 'Wǒ de shǒujī hào shì…', 'Số điện thoại của tôi là…', 'My mobile number is…')]],
      ['Đi siêu thị', 'Going to the supermarket', [line('A', '你明天去哪儿？', 'Nǐ míngtiān qù nǎr?', 'Ngày mai bạn đi đâu?', 'Where are you going tomorrow?'), line('B', '我想去超市买些东西。', 'Wǒ xiǎng qù chāoshì mǎi xiē dōngxi.', 'Tôi muốn đi siêu thị mua ít đồ.', 'I want to go to the supermarket to buy a few things.')]],
      ['Đi nhà hàng', 'Going to a restaurant', [line('A', '我们怎么去西安饭店？', 'Wǒmen zěnme qù Xī’ān Fàndiàn?', 'Chúng ta đi Nhà hàng Tây An thế nào?', "How do we get to Xi'an Restaurant?"), line('B', '我们坐出租车去。', 'Wǒmen zuò chūzūchē qù.', 'Chúng ta đi taxi.', 'Let us take a taxi.')]],
    ],
  },
  {
    number: 7,
    title: '我晚上六点半下班', pinyin: 'Wǒ wǎnshang liù diǎn bàn xiàbān', titleVi: 'Tôi tan làm lúc 6 giờ 30 tối', titleEn: 'I finish work at 6:30 p.m.',
    objectives: ['Nói thời gian diễn ra sự việc.', 'Dùng “吧” để đề nghị.', 'Dùng “呢” và đặt từ chỉ thời gian đúng vị trí.'],
    vocabulary: [
      ['现在', 'xiànzài', 'bây giờ', 'now', 'danh từ thời gian'], ['点', 'diǎn', 'giờ', "o'clock", 'lượng từ'], ['早上', 'zǎoshang', 'sáng sớm', 'early morning', 'danh từ thời gian'], ['上午', 'shàngwǔ', 'buổi sáng', 'morning', 'danh từ thời gian'], ['分', 'fēn', 'phút', 'minute', 'lượng từ'], ['课', 'kè', 'bài học; tiết học', 'lesson; class', 'danh từ'], ['下午', 'xiàwǔ', 'buổi chiều', 'afternoon', 'danh từ thời gian'], ['见', 'jiàn', 'gặp', 'to meet; to see', 'động từ'], ['吧', 'ba', 'trợ từ đề nghị', 'suggestion particle', 'trợ từ'], ['电影院', 'diànyǐngyuàn', 'rạp chiếu phim', 'cinema', 'danh từ'], ['看', 'kàn', 'xem; nhìn; đọc', 'to see; watch; read', 'động từ'], ['电影', 'diànyǐng', 'phim', 'film; movie', 'danh từ'], ['事', 'shì', 'việc; chuyện', 'matter; affair', 'danh từ'], ['上课', 'shàngkè', 'lên lớp; bắt đầu học', 'to attend class', 'động từ'], ['呢', 'ne', 'trợ từ xác nhận tình trạng', 'particle indicating an ongoing fact', 'trợ từ'], ['半', 'bàn', 'nửa; rưỡi', 'half', 'số từ'], ['下课', 'xiàkè', 'tan học', 'to finish class', 'động từ'], ['在', 'zài', 'ở; tại', 'to be at', 'động từ'], ['家', 'jiā', 'nhà', 'home', 'danh từ'], ['里', 'lǐ', 'trong; bên trong', 'inside', 'danh từ phương vị'], ['晚上', 'wǎnshang', 'buổi tối', 'evening', 'danh từ thời gian'], ['医院', 'yīyuàn', 'bệnh viện', 'hospital', 'danh từ'], ['上班', 'shàngbān', 'đi làm', 'to go to work', 'động từ'], ['店', 'diàn', 'cửa hàng', 'shop', 'danh từ'], ['菜', 'cài', 'rau; món ăn', 'vegetable; dish', 'danh từ'], ['分钟', 'fēnzhōng', 'phút', 'minute', 'danh từ'], ['后', 'hòu', 'sau', 'after; behind', 'danh từ phương vị'],
    ],
    grammar: [
      ['Cách nói thời gian', 'Telling time', '时间表达', 'Từ chỉ thời gian thường đứng trước động từ.', 'Time expressions normally come before the verb.', ['她上午十点半上课。', '我晚上六点半下班。']],
      ['Trợ từ “吧”', 'The particle 吧', '语气助词“吧”', '“吧” ở cuối câu làm lời đề nghị nhẹ nhàng.', '吧 softens a suggestion at the end of a sentence.', ['下午两点见吧。']],
      ['Trợ từ “呢”', 'The particle 呢', '语气助词“呢”', '“呢” có thể nhấn mạnh hoặc xác nhận một tình trạng đang tồn tại.', '呢 can emphasize or confirm an ongoing situation.', ['我明天下午两点还上课呢。']],
    ],
    dialogues: [
      ['Hẹn gặp', 'Making an appointment', [line('A', '我们下午两点见吧。', 'Wǒmen xiàwǔ liǎng diǎn jiàn ba.', 'Chúng ta gặp nhau lúc hai giờ chiều nhé.', 'Let us meet at two in the afternoon.'), line('B', '好，在电影院见。', 'Hǎo, zài diànyǐngyuàn jiàn.', 'Được, gặp ở rạp chiếu phim.', 'Okay, see you at the cinema.')]],
      ['Lịch học', 'Class schedule', [line('A', '你几点上课？', 'Nǐ jǐ diǎn shàngkè?', 'Bạn mấy giờ vào học?', 'What time does your class start?'), line('B', '我上午十点半上课。', 'Wǒ shàngwǔ shí diǎn bàn shàngkè.', 'Tôi học lúc 10 giờ 30 sáng.', 'My class starts at 10:30 a.m.')]],
      ['Tan làm', 'Finishing work', [line('A', '你晚上几点下班？', 'Nǐ wǎnshang jǐ diǎn xiàbān?', 'Buổi tối bạn mấy giờ tan làm?', 'What time do you finish work in the evening?'), line('B', '我晚上六点半下班。', 'Wǒ wǎnshang liù diǎn bàn xiàbān.', 'Tôi tan làm lúc 6 giờ 30 tối.', 'I finish work at 6:30 p.m.')]],
    ],
  },
  {
    number: 8,
    title: '我爸爸也在医院工作', pinyin: 'Wǒ bàba yě zài yīyuàn gōngzuò', titleVi: 'Bố tôi cũng làm việc ở bệnh viện', titleEn: 'My father also works at a hospital',
    objectives: ['Mô tả vị trí và nơi chốn.', 'Dùng giới từ “在”.', 'Dùng động từ năng nguyện “能”.'],
    vocabulary: [
      ['房间', 'fángjiān', 'phòng', 'room', 'danh từ'], ['外', 'wài', 'ngoài; bên ngoài', 'outside', 'danh từ phương vị'], ['只', 'zhī', 'lượng từ chỉ động vật', 'measure word for animals', 'lượng từ'], ['小', 'xiǎo', 'nhỏ', 'small', 'tính từ'], ['猫', 'māo', 'mèo', 'cat', 'danh từ'], ['没', 'méi', 'không; chưa', 'not; not yet', 'phó từ'], ['看见', 'kànjiàn', 'nhìn thấy', 'to see', 'động từ'], ['桌子', 'zhuōzi', 'bàn', 'table', 'danh từ'], ['下', 'xià', 'dưới', 'under; below', 'danh từ phương vị'], ['漂亮', 'piàoliang', 'đẹp', 'beautiful', 'tính từ'], ['在', 'zài', 'ở; tại', 'at; in', 'giới từ / động từ'], ['学校', 'xuéxiào', 'trường học', 'school', 'danh từ'], ['书店', 'shūdiàn', 'hiệu sách', 'bookstore', 'danh từ'], ['前', 'qián', 'trước; phía trước', 'front; before', 'danh từ phương vị'], ['能', 'néng', 'có thể', 'can; be able to', 'động từ năng nguyện'], ['到', 'dào', 'đến', 'to arrive', 'động từ'], ['午饭', 'wǔfàn', 'bữa trưa', 'lunch', 'danh từ'], ['饭', 'fàn', 'cơm; bữa ăn', 'meal; rice', 'danh từ'], ['大', 'dà', 'to; lớn', 'big; large', 'tính từ'], ['病人', 'bìngrén', 'bệnh nhân', 'patient', 'danh từ'], ['多', 'duō', 'nhiều', 'many; much', 'tính từ'], ['医生', 'yīshēng', 'bác sĩ', 'doctor', 'danh từ'], ['工作', 'gōngzuò', 'làm việc; công việc', 'to work; work', 'động từ / danh từ'], ['胡医生', 'Hú yīshēng', 'bác sĩ Hồ', 'Doctor Hu', 'danh từ riêng'],
    ],
    grammar: [
      ['Từ chỉ vị trí', 'Location words', '方位词', 'Từ phương vị đặt sau danh từ để tạo cụm chỉ nơi chốn.', 'A location word follows a noun to form a place phrase.', ['房间里', '桌子上', '学校前边']],
      ['“在” + nơi chốn + động từ', '在 + place + verb', '“在”字结构', '“在” đưa nơi diễn ra hành động lên trước động từ chính.', '在 introduces the place of an action before the main verb.', ['我在学校吃午饭。', '他爸爸在医院工作。']],
      ['Động từ năng nguyện “能”', 'The modal verb 能', '能愿动词“能”', '“能” biểu thị khả năng hoặc điều kiện cho phép.', '能 expresses ability or possibility under the circumstances.', ['下午两点你能到吗？', '我不能去学校吃午饭。']],
    ],
    dialogues: [
      ['Con mèo ở đâu?', 'Where is the cat?', [line('A', '你看见小猫了吗？', 'Nǐ kànjiàn xiǎomāo le ma?', 'Bạn nhìn thấy con mèo nhỏ chưa?', 'Have you seen the kitten?'), line('B', '它在桌子下。', 'Tā zài zhuōzi xià.', 'Nó ở dưới bàn.', 'It is under the table.')]],
      ['Nơi làm việc', 'Workplace', [line('A', '你爸爸在哪儿工作？', 'Nǐ bàba zài nǎr gōngzuò?', 'Bố bạn làm việc ở đâu?', 'Where does your father work?'), line('B', '我爸爸也在医院工作。', 'Wǒ bàba yě zài yīyuàn gōngzuò.', 'Bố tôi cũng làm việc ở bệnh viện.', 'My father also works at a hospital.')]],
      ['Đến đúng giờ', 'Arriving on time', [line('A', '下午两点你能到吗？', 'Xiàwǔ liǎng diǎn nǐ néng dào ma?', 'Hai giờ chiều bạn có thể đến không?', 'Can you arrive at two in the afternoon?'), line('B', '我能到。', 'Wǒ néng dào.', 'Tôi có thể đến.', 'I can arrive then.')]],
    ],
  },
  {
    number: 9,
    title: '我明天上午在学校学习', pinyin: 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí', titleVi: 'Sáng mai tôi học ở trường', titleEn: 'I will study at school tomorrow morning',
    objectives: ['Dùng câu tồn hiện cơ bản.', 'Sắp xếp đúng từ chỉ thời gian và nơi chốn.', 'Dùng “第” để biểu thị thứ tự.'],
    vocabulary: [
      ['前边', 'qiánbian', 'phía trước', 'in front', 'danh từ phương vị'], ['边', 'bian', 'phía; bên', 'side; suffix for location', 'hậu tố'], ['家', 'jiā', 'lượng từ cho cửa hàng, doanh nghiệp', 'measure word for businesses', 'lượng từ'], ['那个', 'nàge', 'cái kia; người kia', 'that one', 'đại từ'], ['外边', 'wàibian', 'bên ngoài', 'outside', 'danh từ phương vị'], ['椅子', 'yǐzi', 'ghế', 'chair', 'danh từ'], ['上', 'shàng', 'trên', 'on; above', 'danh từ phương vị'], ['本', 'běn', 'lượng từ cho sách', 'measure word for books', 'lượng từ'], ['书', 'shū', 'sách', 'book', 'danh từ'], ['那', 'nà', 'kia; đó', 'that', 'đại từ'], ['第', 'dì', 'thứ; tiền tố chỉ thứ tự', 'ordinal prefix', 'tiền tố'], ['学习', 'xuéxí', 'học tập', 'to study', 'động từ'], ['做', 'zuò', 'làm', 'to do; make', 'động từ'], ['白天', 'báitiān', 'ban ngày', 'daytime', 'danh từ thời gian'], ['读书', 'dúshū', 'đọc sách; đi học', 'to read; to study', 'động từ'], ['和', 'hé', 'cùng với; và', 'with; and', 'giới từ / liên từ'], ['朋友', 'péngyou', 'bạn bè', 'friend', 'danh từ'], ['唱', 'chàng', 'hát', 'to sing', 'động từ'], ['歌', 'gē', 'bài hát', 'song', 'danh từ'], ['好听', 'hǎotīng', 'hay; dễ nghe', 'pleasant to hear', 'tính từ'], ['电视', 'diànshì', 'tivi', 'television', 'danh từ'], ['狗', 'gǒu', 'chó', 'dog', 'danh từ'], ['玩', 'wán', 'chơi', 'to play', 'động từ'],
    ],
    grammar: [
      ['Câu tồn hiện', 'Existential sentences', '存现句', 'Dùng “nơi chốn + 有/是 + sự vật” để nói cái gì tồn tại ở đâu.', 'Use place + 有/是 + entity to say what exists somewhere.', ['学校前边有一家电影院。', '电影院前边是一家超市。', '桌子上没有小猫。']],
      ['Thời gian trước nơi chốn', 'Time before place', '时间在地点前', 'Khi cùng xuất hiện, từ chỉ thời gian thường đứng trước cụm chỉ nơi chốn.', 'When both occur, time normally comes before place.', ['我们七点在电影院外边见。']],
      ['Số thứ tự với “第”', 'Ordinals with 第', '序数“第”', 'Đặt “第” trước số đếm để tạo số thứ tự.', 'Put 第 before a cardinal number to form an ordinal.', ['第一', '第二', '第三', '第一本书']],
    ],
    dialogues: [
      ['Trước trường', 'In front of the school', [line('A', '学校前边有什么？', 'Xuéxiào qiánbian yǒu shénme?', 'Phía trước trường có gì?', 'What is in front of the school?'), line('B', '学校前边有一家电影院。', 'Xuéxiào qiánbian yǒu yì jiā diànyǐngyuàn.', 'Phía trước trường có một rạp chiếu phim.', 'There is a cinema in front of the school.')]],
      ['Cuốn sách thứ nhất', 'The first book', [line('A', '椅子上的书是谁的？', 'Yǐzi shàng de shū shì shéi de?', 'Sách trên ghế là của ai?', 'Whose book is on the chair?'), line('B', '第一本书是我的。', 'Dì yī běn shū shì wǒ de.', 'Cuốn sách thứ nhất là của tôi.', 'The first book is mine.')]],
      ['Kế hoạch ngày mai', 'Tomorrow’s plan', [line('A', '你明天上午在哪儿学习？', 'Nǐ míngtiān shàngwǔ zài nǎr xuéxí?', 'Sáng mai bạn học ở đâu?', 'Where will you study tomorrow morning?'), line('B', '我明天上午在学校学习。', 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.', 'Sáng mai tôi học ở trường.', 'I will study at school tomorrow morning.')]],
    ],
  },
  {
    number: 10,
    title: '这儿的苹果真便宜！', pinyin: 'Zhèr de píngguǒ zhēn piányi!', titleVi: 'Táo ở đây thật rẻ!', titleEn: 'The apples here are really cheap!',
    objectives: ['Hỏi và trả lời giá tiền.', 'Dùng câu vị ngữ tính từ.', 'Hỏi nhận xét với “怎么样”.'],
    vocabulary: [
      ['杯子', 'bēizi', 'cốc; ly', 'cup', 'danh từ'], ['售货员', 'shòuhuòyuán', 'nhân viên bán hàng', 'salesperson', 'danh từ'], ['这边', 'zhèbiān', 'phía này; bên này', 'this side; over here', 'đại từ nơi chốn'], ['钱', 'qián', 'tiền', 'money', 'danh từ'], ['这些', 'zhèxiē', 'những cái này', 'these', 'đại từ'], ['块', 'kuài', 'đồng; tệ (khẩu ngữ)', 'yuan in speech; piece', 'lượng từ'], ['那些', 'nàxiē', 'những cái kia', 'those', 'đại từ'], ['这儿', 'zhèr', 'ở đây', 'here', 'đại từ nơi chốn'], ['水果', 'shuǐguǒ', 'hoa quả', 'fruit', 'danh từ'], ['少', 'shǎo', 'ít', 'few; little', 'tính từ'], ['斤', 'jīn', 'cân Trung Quốc (500 g)', 'jin; 500 grams', 'lượng từ'], ['苹果', 'píngguǒ', 'táo', 'apple', 'danh từ'], ['便宜', 'piányi', 'rẻ', 'cheap', 'tính từ'], ['商店', 'shāngdiàn', 'cửa hàng', 'shop; store', 'danh từ'], ['衣服', 'yīfu', 'quần áo', 'clothes', 'danh từ'], ['件', 'jiàn', 'lượng từ cho quần áo', 'measure word for clothing', 'lượng từ'], ['元', 'yuán', 'nhân dân tệ', 'yuan', 'lượng từ'], ['怎么样', 'zěnmeyàng', 'thế nào', 'how; what about', 'đại từ nghi vấn'], ['贵', 'guì', 'đắt', 'expensive', 'tính từ'], ['穿', 'chuān', 'mặc', 'to wear', 'động từ'], ['女', 'nǚ', 'nữ', 'female', 'tính từ'], ['男', 'nán', 'nam', 'male', 'tính từ'], ['那儿', 'nàr', 'ở đó', 'there', 'đại từ nơi chốn'],
    ],
    grammar: [
      ['Cách nói giá tiền', 'Prices', '价格表达', 'Đơn vị tiền theo thứ tự “元/块、角/毛、分”.', 'Currency units are ordered as 元/块, 角/毛, then 分.', ['十块钱', '二十元']],
      ['Câu vị ngữ tính từ', 'Adjectival-predicate sentences', '形容词谓语句', 'Tính từ có thể trực tiếp làm vị ngữ; thường dùng “很、真、太”.', 'An adjective can be the predicate, often with 很, 真, or 太.', ['这儿的水果真不少！', '我的房间不大。', '那个苹果好吃。']],
      ['Hỏi với “怎么样”', 'Questions with 怎么样', '“怎么样”问句', 'Dùng “怎么样” để hỏi nhận xét hoặc tình trạng.', 'Use 怎么样 to ask for an opinion or condition.', ['这个杯子怎么样？']],
    ],
    dialogues: [
      ['Mua táo', 'Buying apples', [line('A', '苹果多少钱一斤？', 'Píngguǒ duōshao qián yì jīn?', 'Táo bao nhiêu tiền một cân?', 'How much are the apples per jin?'), line('B', '五块钱一斤。', 'Wǔ kuài qián yì jīn.', 'Năm tệ một cân.', 'Five yuan per jin.')]],
      ['Táo rẻ', 'Cheap apples', [line('A', '这儿的苹果真便宜！', 'Zhèr de píngguǒ zhēn piányi!', 'Táo ở đây thật rẻ!', 'The apples here are really cheap!'), line('B', '这些也很好吃。', 'Zhèxiē yě hěn hǎochī.', 'Những quả này cũng rất ngon.', 'These are also delicious.')]],
      ['Thử quần áo', 'Trying on clothes', [line('A', '这件衣服怎么样？', 'Zhè jiàn yīfu zěnmeyàng?', 'Bộ quần áo này thế nào?', 'How is this item of clothing?'), line('B', '很好看，也不贵。', 'Hěn hǎokàn, yě bú guì.', 'Rất đẹp, cũng không đắt.', 'It looks good and is not expensive.')]],
    ],
  },
  {
    number: 11,
    title: '我读大学呢', pinyin: 'Wǒ dú dàxué ne', titleVi: 'Tôi đang học đại học', titleEn: 'I am studying at university',
    objectives: ['Nói hành động đang diễn ra.', 'Đặt câu hỏi chính phản với dạng A-không-A.', 'Dùng “要” để nói dự định.'],
    vocabulary: [
      ['时候', 'shíhou', 'lúc; khi', 'time; moment', 'danh từ'], ['饭店', 'fàndiàn', 'nhà hàng; khách sạn', 'restaurant; hotel', 'danh từ'], ['知道', 'zhīdào', 'biết', 'to know', 'động từ'], ['正在', 'zhèngzài', 'đang', 'currently; in the process of', 'phó từ'], ['找', 'zhǎo', 'tìm', 'to look for', 'động từ'], ['开车', 'kāichē', 'lái xe', 'to drive', 'động từ'], ['车', 'chē', 'xe', 'vehicle; car', 'danh từ'], ['在', 'zài', 'đang', 'in the process of', 'phó từ'], ['读', 'dú', 'đọc; theo học', 'to read; to study', 'động từ'], ['大学', 'dàxué', 'đại học', 'university', 'danh từ'], ['大学生', 'dàxuéshēng', 'sinh viên đại học', 'university student', 'danh từ'], ['学', 'xué', 'học', 'to study; learn', 'động từ'], ['医', 'yī', 'y; y học', 'medicine', 'danh từ'], ['弟弟', 'dìdi', 'em trai', 'younger brother', 'danh từ'], ['起床', 'qǐchuáng', 'thức dậy; ra khỏi giường', 'to get up', 'động từ'], ['睡觉', 'shuìjiào', 'ngủ', 'to sleep', 'động từ'], ['睡', 'shuì', 'ngủ', 'to sleep', 'động từ'], ['那里', 'nàlǐ', 'ở đó', 'there', 'đại từ nơi chốn'], ['哪里', 'nǎlǐ', 'ở đâu', 'where', 'đại từ nghi vấn'], ['昨天', 'zuótiān', 'hôm qua', 'yesterday', 'danh từ thời gian'], ['问', 'wèn', 'hỏi', 'to ask', 'động từ'], ['对', 'duì', 'đối với; hướng về', 'toward; to', 'giới từ'], ['说', 'shuō', 'nói', 'to speak; say', 'động từ'], ['要', 'yào', 'muốn; định; sẽ', 'to want; plan to', 'động từ năng nguyện'], ['小朋友', 'xiǎopéngyǒu', 'trẻ em; bạn nhỏ', 'child', 'danh từ'],
    ],
    grammar: [
      ['Câu hỏi chính phản', 'Affirmative-negative questions', '正反疑问句', 'Lặp động từ hoặc tính từ ở dạng khẳng định và phủ định để hỏi lựa chọn đúng–sai.', 'Repeat a verb or adjective in affirmative and negative forms to ask a yes-or-no question.', ['它是不是在超市后边？', '你去没去学校？', '这件衣服好看不好看？']],
      ['Hành động đang diễn ra', 'Ongoing actions', '动作的进行', 'Dùng “在/正在 + động từ”, có thể thêm “呢” ở cuối câu.', 'Use 在/正在 + verb, optionally followed by 呢.', ['你还在读大学吗？', '学生们正在上课呢。']],
      ['Động từ năng nguyện “要”', 'The modal verb 要', '能愿动词“要”', '“要” đứng trước động từ để biểu thị dự định hoặc mong muốn.', '要 comes before a verb to express a plan or desire.', ['他今天要和小朋友玩。']],
    ],
    dialogues: [
      ['Đang tìm nhà hàng', 'Looking for a restaurant', [line('A', '你正在找什么？', 'Nǐ zhèngzài zhǎo shénme?', 'Bạn đang tìm gì?', 'What are you looking for?'), line('B', '我正在找饭店。', 'Wǒ zhèngzài zhǎo fàndiàn.', 'Tôi đang tìm nhà hàng.', 'I am looking for a restaurant.')]],
      ['Học đại học', 'Studying at university', [line('A', '你是大学生吗？', 'Nǐ shì dàxuéshēng ma?', 'Bạn là sinh viên đại học à?', 'Are you a university student?'), line('B', '对，我读大学呢。', 'Duì, wǒ dú dàxué ne.', 'Đúng, tôi đang học đại học.', 'Yes, I am studying at university.')]],
      ['Kế hoạch hôm nay', 'Today’s plan', [line('A', '你弟弟今天要做什么？', 'Nǐ dìdi jīntiān yào zuò shénme?', 'Hôm nay em trai bạn định làm gì?', 'What is your younger brother going to do today?'), line('B', '他要和小朋友玩。', 'Tā yào hé xiǎopéngyǒu wán.', 'Em ấy sẽ chơi với các bạn nhỏ.', 'He is going to play with the children.')]],
    ],
  },
  {
    number: 12,
    title: '昨天下雪了', pinyin: 'Zuótiān xià xuě le', titleVi: 'Hôm qua tuyết đã rơi', titleEn: 'It snowed yesterday',
    objectives: ['Nói về thời tiết và tình trạng sức khỏe.', 'Dùng “了” để biểu thị thay đổi.', 'Dùng cấu trúc “太……了”.'],
    vocabulary: [
      ['天气', 'tiānqì', 'thời tiết', 'weather', 'danh từ'], ['这里', 'zhèlǐ', 'ở đây', 'here', 'đại từ nơi chốn'], ['天', 'tiān', 'trời; ngày; lượng từ chỉ ngày', 'weather; day; measure word for days', 'danh từ / lượng từ'], ['下雨', 'xià yǔ', 'mưa', 'to rain', 'động từ'], ['了', 'le', 'trợ từ biểu thị thay đổi', 'particle indicating change', 'trợ từ'], ['雨', 'yǔ', 'mưa', 'rain', 'danh từ'], ['有点儿', 'yǒudiǎnr', 'hơi; có một chút', 'a little; somewhat', 'phó từ'], ['觉得', 'juéde', 'cảm thấy', 'to feel; think', 'động từ'], ['冷', 'lěng', 'lạnh', 'cold', 'tính từ'], ['下', 'xià', 'rơi (mưa, tuyết)', 'to fall as rain or snow', 'động từ'], ['雪', 'xuě', 'tuyết', 'snow', 'danh từ'], ['来', 'lái', 'đến', 'to come', 'động từ'], ['公司', 'gōngsī', 'công ty', 'company', 'danh từ'], ['生病', 'shēngbìng', 'bị ốm', 'to fall ill', 'động từ'], ['看病', 'kànbìng', 'đi khám bệnh', 'to see a doctor', 'động từ'], ['病', 'bìng', 'ốm; bệnh', 'illness; sick', 'danh từ / tính từ'], ['一点儿', 'yìdiǎnr', 'một chút', 'a little', 'số lượng từ'], ['药', 'yào', 'thuốc', 'medicine', 'danh từ'], ['回', 'huí', 'trở về', 'to return', 'động từ'], ['再', 'zài', 'lại; rồi; sau đó', 'again; then', 'phó từ'], ['喝', 'hē', 'uống', 'to drink', 'động từ'], ['热', 'rè', 'nóng', 'hot', 'tính từ'], ['水', 'shuǐ', 'nước', 'water', 'danh từ'],
    ],
    grammar: [
      ['Câu phi chủ vị', 'Subjectless sentences', '非主谓句', 'Hiện tượng thời tiết có thể diễn đạt không cần chủ ngữ.', 'Weather phenomena can be expressed without an explicit subject.', ['下雨了。', '下雪了。']],
      ['Trợ từ “了” biểu thị thay đổi', 'Change-of-state 了', '语气助词“了”', '“了” ở cuối câu báo hiệu tình huống mới hoặc sự thay đổi.', 'Sentence-final 了 signals a new situation or change.', ['十二点了，吃午饭吧。', '昨天下雪了。']],
      ['Cấu trúc “太……了”', 'The 太…了 pattern', '“太……了”结构', '“太 + tính từ + 了” nhấn mạnh mức độ cao.', '太 + adjective + 了 expresses a high degree.', ['太冷了！', '这个杯子太小了。']],
    ],
    dialogues: [
      ['Thời tiết', 'Weather', [line('A', '昨天天气怎么样？', 'Zuótiān tiānqì zěnmeyàng?', 'Thời tiết hôm qua thế nào?', 'How was the weather yesterday?'), line('B', '昨天下雪了，太冷了！', 'Zuótiān xià xuě le, tài lěng le!', 'Hôm qua có tuyết, lạnh quá!', 'It snowed yesterday and was very cold!')]],
      ['Bị ốm', 'Feeling ill', [line('A', '你生病了吗？', 'Nǐ shēngbìng le ma?', 'Bạn bị ốm à?', 'Are you ill?'), line('B', '我有点儿不舒服。', 'Wǒ yǒudiǎnr bù shūfu.', 'Tôi hơi khó chịu.', 'I feel a little unwell.')]],
      ['Uống nước nóng', 'Drinking hot water', [line('A', '吃一点儿药，再喝热水。', 'Chī yìdiǎnr yào, zài hē rè shuǐ.', 'Uống một ít thuốc rồi uống nước nóng.', 'Take a little medicine, then drink hot water.'), line('B', '好，谢谢。', 'Hǎo, xièxie.', 'Được, cảm ơn.', 'Okay, thank you.')]],
    ],
  },
  {
    number: 13,
    title: '请给我一杯茶', pinyin: 'Qǐng gěi wǒ yì bēi chá', titleVi: 'Cho tôi một tách trà', titleEn: 'Please give me a cup of tea',
    objectives: ['Gọi món và yêu cầu phục vụ lịch sự.', 'Dùng câu hai tân ngữ.', 'Dùng “可以” và động từ + “一下”.'],
    vocabulary: [
      ['可以', 'kěyǐ', 'có thể; được phép', 'can; may', 'động từ năng nguyện'], ['再', 'zài', 'lại; thêm', 'again; another', 'phó từ'], ['问题', 'wèntí', 'câu hỏi; vấn đề', 'question; problem', 'danh từ'], ['卖', 'mài', 'bán', 'to sell', 'động từ'], ['打电话', 'dǎ diànhuà', 'gọi điện thoại', 'to make a phone call', 'động từ'], ['一下', 'yíxià', 'một chút; một lần', 'once; briefly', 'bổ ngữ'], ['服务员', 'fúwùyuán', 'nhân viên phục vụ', 'server; attendant', 'danh từ'], ['女士', 'nǚshì', 'quý cô; quý bà', 'lady; Ms.', 'danh từ'], ['请', 'qǐng', 'mời; xin vui lòng', 'please; to invite', 'động từ'], ['坐', 'zuò', 'ngồi', 'to sit', 'động từ'], ['给', 'gěi', 'cho; đưa', 'to give', 'động từ'], ['杯', 'bēi', 'cốc; lượng từ cho đồ uống', 'cup; measure word for drinks', 'lượng từ'], ['要', 'yào', 'muốn; gọi món', 'to want; to order', 'động từ'], ['早饭', 'zǎofàn', 'bữa sáng', 'breakfast', 'danh từ'], ['这个', 'zhège', 'cái này', 'this one', 'đại từ'], ['面包', 'miànbāo', 'bánh mì', 'bread', 'danh từ'], ['鸡蛋', 'jīdàn', 'trứng gà', 'egg', 'danh từ'], ['先生', 'xiānsheng', 'ông; ngài', 'Mr.; sir', 'danh từ'], ['一半', 'yíbàn', 'một nửa', 'one half', 'số lượng từ'], ['茶', 'chá', 'trà', 'tea', 'danh từ'],
    ],
    grammar: [
      ['Động từ năng nguyện “可以”', 'The modal verb 可以', '能愿动词“可以”', '“可以” biểu thị sự cho phép hoặc khả năng.', '可以 expresses permission or possibility.', ['我可以再问您一个问题吗？']],
      ['Động từ + “一下”', 'Verb + 一下', '动词＋“一下”', '“一下” sau động từ làm hành động ngắn và lời nói nhẹ nhàng hơn.', '一下 after a verb makes an action brief and a request softer.', ['你可以打电话问一下。']],
      ['Câu hai tân ngữ', 'Double-object sentences', '双宾语句', 'Động từ như “给、问” có thể đi với tân ngữ chỉ người và tân ngữ chỉ vật.', 'Verbs such as 给 and 问 can take a person object and a thing object.', ['请给我一杯牛奶。', '白家月给安妮一个苹果。', '我问老师两个问题。']],
    ],
    dialogues: [
      ['Hỏi thêm', 'Asking another question', [line('A', '我可以再问您一个问题吗？', 'Wǒ kěyǐ zài wèn nín yí ge wèntí ma?', 'Tôi có thể hỏi ngài thêm một câu không?', 'May I ask you another question?'), line('B', '可以。', 'Kěyǐ.', 'Được.', 'Yes, you may.')]],
      ['Gọi món', 'Ordering food', [line('服务员', '女士，请坐。', 'Nǚshì, qǐng zuò.', 'Thưa cô, mời ngồi.', 'Please have a seat, ma’am.'), line('客人', '请给我一杯茶。', 'Qǐng gěi wǒ yì bēi chá.', 'Cho tôi một tách trà.', 'Please give me a cup of tea.')]],
      ['Bữa sáng', 'Breakfast', [line('A', '先生，您要什么？', 'Xiānsheng, nín yào shénme?', 'Thưa ông, ông muốn dùng gì?', 'Sir, what would you like?'), line('B', '我要一个面包和两个鸡蛋。', 'Wǒ yào yí ge miànbāo hé liǎng ge jīdàn.', 'Tôi muốn một bánh mì và hai quả trứng.', 'I would like one bread roll and two eggs.')]],
    ],
  },
  {
    number: 14,
    title: '我看了一个电影', pinyin: 'Wǒ kàn le yí ge diànyǐng', titleVi: 'Tôi đã xem một bộ phim', titleEn: 'I watched a film',
    objectives: ['Dùng “了” sau động từ để nói hành động đã hoàn thành.', 'Dùng phó từ “都”.', 'Nhận biết động từ li hợp.'],
    vocabulary: [
      ['上', 'shàng', 'lên; lên xe; bắt đầu học', 'to board; go up; begin attending', 'động từ'], ['火车', 'huǒchē', 'tàu hỏa', 'train', 'danh từ'], ['中午', 'zhōngwǔ', 'buổi trưa', 'noon', 'danh từ thời gian'], ['开', 'kāi', 'khởi hành; mở', 'to depart; open', 'động từ'], ['有些', 'yǒuxiē', 'một số', 'some', 'đại từ'], ['有的', 'yǒude', 'có người; có cái', 'some; some of them', 'đại từ'], ['了', 'le', 'trợ từ chỉ hành động hoàn thành', 'completed-action particle', 'trợ từ'], ['写', 'xiě', 'viết', 'to write', 'động từ'], ['都', 'dōu', 'đều; tất cả', 'all; both', 'phó từ'], ['听见', 'tīngjiàn', 'nghe thấy', 'to hear', 'động từ'], ['不要', 'búyào', 'đừng; không được', 'do not', 'phó từ'], ['说话', 'shuōhuà', 'nói chuyện', 'to speak; talk', 'động từ'], ['听', 'tīng', 'nghe', 'to listen', 'động từ'], ['哪些', 'nǎxiē', 'những… nào', 'which ones', 'đại từ nghi vấn'], ['字', 'zì', 'chữ', 'character; written word', 'danh từ'], ['汉语', 'Hànyǔ', 'tiếng Hán; tiếng Trung', 'Chinese language', 'danh từ'], ['汉字', 'Hànzì', 'chữ Hán', 'Chinese character', 'danh từ'], ['明年', 'míngnián', 'năm sau', 'next year', 'danh từ thời gian'], ['中学', 'zhōngxué', 'trường trung học', 'middle school', 'danh từ'], ['小学', 'xiǎoxué', 'trường tiểu học', 'primary school', 'danh từ'], ['中学生', 'zhōngxuéshēng', 'học sinh trung học', 'middle-school student', 'danh từ'], ['小学生', 'xiǎoxuéshēng', 'học sinh tiểu học', 'primary-school student', 'danh từ'], ['上学', 'shàngxué', 'đi học', 'to attend school', 'động từ'], ['他们', 'tāmen', 'họ (nam hoặc hỗn hợp)', 'they; them', 'đại từ'], ['她们', 'tāmen', 'họ (nữ)', 'they; them for females', 'đại từ'], ['它们', 'tāmen', 'chúng (đồ vật, động vật)', 'they; them for non-humans', 'đại từ'], ['晚', 'wǎn', 'muộn', 'late', 'tính từ'],
    ],
    grammar: [
      ['Động từ + “了”', 'Verb + 了', '动词＋“了”', '“了” đặt sau động từ để biểu thị hành động đã hoàn thành.', '了 after a verb marks a completed action.', ['我看了一个电影。', '我买了一个新电脑。', '我昨天没去商店买东西。']],
      ['Động từ li hợp', 'Separable verbs', '离合词', 'Một số động từ như “说话、上学” có thể tách ra khi thêm thành phần khác.', 'Some verbs such as 说话 and 上学 can separate when other elements are inserted.', ['不要说话。', '明年上小学。']],
      ['Phó từ “都”', 'The adverb 都', '副词“都”', '“都” đứng trước vị ngữ để bao quát tất cả các thành phần đã nêu.', '都 comes before the predicate and refers to all previously mentioned items.', ['我们都会写了。', '同学们都没听见。']],
    ],
    dialogues: [
      ['Xem phim', 'Watching a film', [line('A', '你昨天做什么了？', 'Nǐ zuótiān zuò shénme le?', 'Hôm qua bạn đã làm gì?', 'What did you do yesterday?'), line('B', '我看了一个电影。', 'Wǒ kàn le yí ge diànyǐng.', 'Tôi đã xem một bộ phim.', 'I watched a film.')]],
      ['Viết chữ Hán', 'Writing Chinese characters', [line('A', '你会写哪些汉字？', 'Nǐ huì xiě nǎxiē Hànzì?', 'Bạn biết viết những chữ Hán nào?', 'Which Chinese characters can you write?'), line('B', '我们都会写了。', 'Wǒmen dōu huì xiě le.', 'Chúng tôi đều biết viết rồi.', 'We can all write now.')]],
      ['Năm sau đi học', 'Starting school next year', [line('A', '孩子们明年都上学吗？', 'Háizimen míngnián dōu shàngxué ma?', 'Năm sau các con đều đi học à?', 'Will all the children attend school next year?'), line('B', '女儿和儿子都要上小学。', 'Nǚ’ér hé érzi dōu yào shàng xiǎoxué.', 'Con gái và con trai đều sẽ vào tiểu học.', 'Both my daughter and son will start primary school.')]],
    ],
  },
  {
    number: 15,
    title: '大兴机场见！', pinyin: 'Dàxīng Jīchǎng jiàn!', titleVi: 'Hẹn gặp ở Sân bay Đại Hưng!', titleEn: 'See you at Daxing Airport!',
    objectives: ['Nói kế hoạch du lịch và thời gian di chuyển.', 'Dùng câu ghép với “还/也”.', 'Vận dụng phép lịch sự khi đón tiếp khách.'],
    vocabulary: [
      ['爱', 'ài', 'yêu; rất thích', 'to love; like', 'động từ'], ['哪个', 'nǎge', 'cái nào; người nào', 'which one', 'đại từ nghi vấn'], ['去年', 'qùnián', 'năm ngoái', 'last year', 'danh từ thời gian'], ['男朋友', 'nánpéngyou', 'bạn trai', 'boyfriend', 'danh từ'], ['几', 'jǐ', 'mấy; vài', 'how many; several', 'đại từ nghi vấn'], ['年', 'nián', 'năm', 'year', 'danh từ'], ['好玩儿', 'hǎowánr', 'vui; thú vị', 'fun; interesting', 'tính từ'], ['西安', 'Xī’ān', 'Tây An', "Xi'an", 'danh từ riêng'], ['北京', 'Běijīng', 'Bắc Kinh', 'Beijing', 'danh từ riêng'], ['飞机', 'fēijī', 'máy bay', 'airplane', 'danh từ'], ['要', 'yào', 'cần; mất (thời gian)', 'to need; take time', 'động từ'], ['小时', 'xiǎoshí', 'tiếng; giờ', 'hour', 'danh từ'], ['家人', 'jiārén', 'người nhà; gia đình', 'family member', 'danh từ'], ['时间', 'shíjiān', 'thời gian', 'time', 'danh từ'], ['机场', 'jīchǎng', 'sân bay', 'airport', 'danh từ'], ['接', 'jiē', 'đón', 'to pick up; meet', 'động từ'], ['住', 'zhù', 'ở; cư trú', 'to live; stay', 'động từ'], ['早', 'zǎo', 'sớm', 'early', 'tính từ / phó từ'], ['那', 'nà', 'vậy; thế thì', 'then; in that case', 'liên từ'], ['大兴机场', 'Dàxīng Jīchǎng', 'Sân bay Đại Hưng', 'Daxing Airport', 'danh từ riêng'],
    ],
    grammar: [
      ['Câu ghép với “也”', 'Compound sentences with 也', '“也”连接的复句', 'Dùng “也” để thêm một sự vật hoặc tình huống tương đồng.', 'Use 也 to add a similar item or situation.', ['我喜欢这个，也喜欢那个。', '王老师是北京人，李文也是北京人。']],
      ['Câu ghép với “还”', 'Compound sentences with 还', '“还”连接的复句', 'Dùng “还” để bổ sung thêm hành động hoặc sở thích.', 'Use 还 to add another action or preference.', ['我喜欢喝中国茶，还喜欢吃中国菜。']],
      ['Thời gian di chuyển', 'Travel duration', '时长表达', 'Dùng “要 + khoảng thời gian” để nói một hành trình mất bao lâu.', 'Use 要 + duration to say how long a journey takes.', ['坐飞机要几个小时？']],
    ],
    dialogues: [
      ['Du lịch Trung Quốc', 'Travel in China', [line('A', '你去过北京和西安吗？', 'Nǐ qùguo Běijīng hé Xī’ān ma?', 'Bạn đã đến Bắc Kinh và Tây An chưa?', "Have you been to Beijing and Xi'an?"), line('B', '我去年去了西安，那里很好玩儿。', 'Wǒ qùnián qù le Xī’ān, nàlǐ hěn hǎowánr.', 'Năm ngoái tôi đã đi Tây An, ở đó rất vui.', "I went to Xi'an last year; it was fun there.")]],
      ['Đi máy bay', 'Flying', [line('A', '坐飞机要几个小时？', 'Zuò fēijī yào jǐ ge xiǎoshí?', 'Đi máy bay mất mấy tiếng?', 'How many hours does the flight take?'), line('B', '要三个小时。', 'Yào sān ge xiǎoshí.', 'Mất ba tiếng.', 'It takes three hours.')]],
      ['Đón ở sân bay', 'Airport pickup', [line('A', '你家人有时间去机场接你吗？', 'Nǐ jiārén yǒu shíjiān qù jīchǎng jiē nǐ ma?', 'Người nhà bạn có thời gian ra sân bay đón bạn không?', 'Does your family have time to pick you up at the airport?'), line('B', '可以，大兴机场见！', 'Kěyǐ, Dàxīng Jīchǎng jiàn!', 'Được, hẹn gặp ở Sân bay Đại Hưng!', 'Yes. See you at Daxing Airport!')]],
    ],
  },
]

function makeQuiz(vocabulary, lessonNumber) {
  return vocabulary.slice(0, Math.min(4, vocabulary.length)).map((current, index) => {
    const choiceWords = [current, ...Array.from({ length: 3 }, (_, offset) => vocabulary[(index + offset + 1) % vocabulary.length])]
    return {
      id: `quiz-${String(index + 1).padStart(2, '0')}`,
      prompt: [`Chọn nghĩa đúng của “${current.hanzi}”.`, `Choose the correct meaning of “${current.hanzi}”.`, `请选择“${current.hanzi}”的正确意思。`],
      choices: [choiceWords.map((item) => item.meaningVi), choiceWords.map((item) => item.meaningEn), choiceWords.map((item) => item.meaningEn)],
      answer: 0,
      lessonNumber,
    }
  })
}

function makeLesson(spec) {
  const root = audioRoot(spec.number)
  const vocabulary = spec.vocabulary.map((item, index) => word(item, index, spec.number))
  const dialogueItems = spec.dialogues.map(([titleVi, titleEn, lines], index) => ({
    id: `dialogue-${String(index + 1).padStart(2, '0')}`,
    titleVi,
    titleEn,
    audio: `${root}/text-${String(index + 1).padStart(2, '0')}.mp3`,
    lines,
  }))
  const officialLines = dialogueItems.flatMap((dialogue) => dialogue.lines)
  const composedLines = dialogueItems.at(-1)?.lines || officialLines.slice(-2)
  return {
    id: `hsk1-lesson-${String(spec.number).padStart(2, '0')}`,
    number: spec.number,
    title: spec.title,
    pinyin: spec.pinyin,
    titleVi: spec.titleVi,
    titleEn: spec.titleEn,
    status: 'published',
    objectives: spec.objectives.map((vi) => ({ vi, en: vi, zh: vi })),
    sourceCoverage: { pptSlides: `PPT tiếng Việt Bài ${spec.number}`, audio: `Audio giáo trình và sách bài tập Bài ${spec.number}` },
    vocabulary,
    grammar: spec.grammar.map(([titleVi, titleEn, titleZh, explanationVi, explanationEn, patterns], index) => ({ id: `grammar-${index + 1}`, titleVi, titleEn, titleZh, explanationVi, explanationEn, patterns })),
    dialogues: dialogueItems,
    pronunciation: {
      audio: `${root}/workbook.mp3`,
      sections: [{ titleVi: 'Nghe và đọc theo từ mới', summaryVi: 'Nghe giọng chuẩn trong tệp bài học rồi đọc lại từng từ.', examples: vocabulary.slice(0, 8).map((item) => `${item.pinyin} ${item.hanzi}`) }],
    },
    workbookExercises: [
      { id: 'wb-listening', type: 'listening', promptVi: `Nghe tệp sách bài tập Bài ${spec.number} và hoàn thành các câu nghe–hiểu.`, itemCount: 1, answerState: 'hidden-until-submit' },
      { id: 'wb-speaking', type: 'repeat', promptVi: 'Đọc to các câu trọng tâm trong bài.', items: officialLines.slice(0, 6).map((item) => item.zh) },
    ],
    tongueTwister: { audio: `${root}/practice.mp3`, lines: spec.tongueTwister || [] },
    quizQuestions: makeQuiz(vocabulary, spec.number),
    shadowing: {
      official: { type: 'official', instructionVi: `Luyện và thu âm các hội thoại chính thức của Bài ${spec.number}.`, audio: `${root}/text-01.mp3`, text: officialLines.map((item) => item.zh).join(' '), pinyin: officialLines.map((item) => item.py).join(' ') },
      composed: { type: 'composed', instructionVi: `Dùng từ và mẫu câu của Bài ${spec.number} để luyện đoạn bổ sung.`, text: composedLines.map((item) => item.zh).join(' '), pinyin: composedLines.map((item) => item.py).join(' ') },
    },
    writing: {
      titleVi: spec.titleVi,
      promptVi: `Viết một đoạn ngắn 5–8 câu theo chủ đề “${spec.titleVi}”. Chỉ dùng từ và mẫu câu đã học đến Bài ${spec.number}.`,
      promptEn: `Write a short 5–8 sentence passage about “${spec.titleEn}”. Use words and patterns learned through Lesson ${spec.number}.`,
      promptZh: `围绕“${spec.title}”写一段5至8句的短文，只使用截至第${spec.number}课学过的词语和句型。`,
      requirements: ['5–8 câu', 'Chữ Hán giản thể', `Dùng ít nhất 5 từ/cụm từ của Bài ${spec.number}`],
      sampleAnswer: null,
    },
  }
}

export const hsk1Lessons = [lessonOne, ...lessonSpecs.map(makeLesson)]

export function getHsk1Lesson(number) {
  return hsk1Lessons.find((lesson) => lesson.number === Number(number)) || null
}

export const lessonRoadmap = hsk1Lessons.map((lesson) => ({ id: lesson.id, number: lesson.number, status: 'ready', title: lesson.title, titleVi: lesson.titleVi, titleEn: lesson.titleEn }))
