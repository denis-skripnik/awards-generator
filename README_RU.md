# awards-generator
Английская версия: [README.md](README.md).

Инструмент генерации наград для Viz блокчейна.

## Что может:
1. Создавать URL наград через форму в файле form.html.
Все поля заполняются по желанию.
Но если вы не заполняете поле энергии, вы потратите 0.01%.
Назначение полей смотрите в подразделе "Описание параметров награды".
В форме также есть возможность просмотра актуальной энергии (Если пользователь авторизован) и сколько придётся её потратить, чтобы дать 1 SHARES.
Ниже (среди полей) есть поле ввода желаемой суммы. В скобках указывается максимальная сумма (Кликнув на неё, подставите в поле). После ввода суммы и перехода к любому другому полю процент энергии в соответствующем поле автоматически меняется: вы сможете узнать, какой её процент придётся потратить для получения нужной суммы.
Авторизация есть и на form.html. Более того, если вы там или на index.html введёте свои данные, они спокойно сохранятся
Если не отмечали флажок сохранения входа - до закрытия браузера,
Если отмечали - на долгое время.
Сделана возможность удобного добавления бенефициаров.
При отсутствии данных в каких-то полях они в url не появляются.
2. Генератор url (файл url.html).
Форма, конечно, удобна простым пользователям, но разработчикам - не очень, поскольку для внедрения сервиса в приложения необходимо видеть url перед глазами.
В генераторе адресов наград всё очень похоже на форму, но названия полей состоят из параметров в url и из пояснения, а не только из пояснений.
Данная функция позволит определиться, какие параметры награды что будут содержать. Например, в memo можно разместить JSON с названием приложения, его id, который меняется раз в сутки, а также author и permlink поста.
Сделана возможность удобного добавления бенефициаров.
Создаётся qr-код с url награды.
3. Формировать адрес награды вручную.
Начну с того, что это стандартные get параметры.
То есть адрес имеет вид:
index.html?target=login&energy=0.7&custom_sequence=0&memo=благодарю за всё&beneficiaries=denis-skripnik:10,on1x:25
Но можно написать так: ?target=login
И вы наградите аккаунт login на 0.01% энергии. Все же остальные параметры будут либо равны 0, либо пусты.
О том, что значит каждый параметр, в следующем разделе.
4. Можно создать форму на builder.html (https://viz.dpos.space/awards/ru/builder.html) и разместить её в своём приложении, основа которого - html + js.
Форма будет автономной, т.е. не переадресовывает на страницу index.html awards-generator, а отправляет награду через скрипт builder.js.
Для работы в вашем приложении (на сайте, в расширении) необходимо подключить viz.min.js и sjcl.min.js (Последний - для шифрования и расшифровки постинг ключа награждающего).
При использовании слайдера, т.е. ползунка выбора процента энергии или процента отчисления награждаемому необходимо подключить ещё 1 скрипт, но его код прописан в результате генерации.
В первом многострочном поле выводится пример создания переменной target_user со значением по умолчанию, которое вы указали в разделе про получателя награды. Вместо него необходимо передать скрипту формы логин того, кому будет идти награда, например, VIZ логин автора страницы, на которой находится собирающийся наградить или логин шлюза, который позволяет награждать пользователей, не имеющих аккаунта VIZ.
5. История наград: history.html. Результат возвращается в виде JSON.
Параметры: account=login - логин аккаунта (Обязательно), initiator=denis-skripnik - фильтрация по инициатору, receiver=liveblogs - фильтрация по получателю, type=benefactor_award - фильтрация по типу операции, benefactor=on1x - фильтрация по бенефициару, limit=10000 - Лимит (макс. 10000).
Указываются в url. Пример: history.html?account=ae&type=benefactor_award&benefactor=denis-skripnik.
Сервис позволит читать уже полученные награды и бенефициарские.

### Описание параметров награды:
Сначала здесь выводится название параметра, как в Url, а потом - как в форме.
- target. В форме "Кого наградить".
Кого наградить вы хотите (аккаунт в блокчейне Viz). В примере выше был взят несуществующий "login".
- energy. В форме "Процент энергии, который вы готовы потратить при награде. Энергия регенерирует за сутки на 20%".
Какой процент энергии вы готовы использовать при отправке награды.
Это показатель, отображаемый на viz.world (Актуальный) и в методе API get_accounts (На момент последней награды/делегирования SHARES).
Он за сутки восстанавливается на 20%. То есть если вы укажете 100, придётся ждать 100% энергии 5 дней.
От затрачиваемой энергии зависит прибыль того, кого награждаете, а также бенефициаров, если их указали (О них далее).
- custom_sequence. В форме "Номер Custom операции, отправленной пользователем ..."
Отображается в get_accounts. указывает на количество отправленных в блокчейн custom операций.
Кроме него есть custom_sequence_block_num, который указывает на блок операции, соответствующей custom_sequence.
Это позволяет приложениям определять нужную операцию, а затем указывать её custom_sequence при отправке награды.
Но фактически в параметр награды "custom_sequence" можно добавить любое число или 0.
Например, это число в определённом приложении может указывать на номер новости в базе данных.
- memo. В форме "Заметка (memo)".
Любой текст, например, пояснение, за что награда.
Также там может содержаться идентификационный текст приложения и (или) идентификация страницы/поста/функции в приложении.
- beneficiaries. В форме "Бенефициары".
Бенефициары. Или те, кто ещё получат прибыль с награды.
При этом указанные проценты суммируются. То есть если вы укажете суммарно бенефициарам 100%, награждаемый ничего не получит.
Т.е. выставив себя бенефициаром на 50%, вы получите половину награды.
Формат:
логин:процент,логин2:процент2. Пример:
denis-skripnik:25,on1x:50 (Отправит бенефициарам 75%, а награждаемому - 25%).
- redirect. В форме "Ссылка для перенаправления после успешной награды (не обязательно)".
Куда перенаправить после успешного награждения.
По умолчанию, после успешной отправки награды выводится информация с параметрами награды. Но если вы хотите перенаправить наградившего на какой-то url, например, отправляющий в базу данных параметры награды, вы можете указать его тут.
"redirect" относится к функционалу сервиса, а не к viz.broadcast.award.

## Главные особенности:
1. Локальность: вы можете скачать и пользоваться.
2. Авторизация без отправки на сервер: Постинг ключ никуда не передаётся, а сохраняется у вас в браузере, да и то по вашему желанию (Если хотите, можете каждый раз вводить логин и ключ);
3. Гибкость: обеспечивается функционалом award, а также редиректом;
4. Лёгкая интеграция в приложения: достаточно знать формат url.
5. Проценты указываются так, как вы их обычно пишете: не 7529, а 75.29;
6. Сервис сам ищет рабочую паблик-Ноду, подключается к ней и запоминает. Если она становится нерабочей, ищет новую и также запоминает...
7. Удобство: все ошибки на Русском, логины можно вводить в любом регистре (Ошибки не будет). Это позволяет использовать генератор наград максимально гибко: выбирая только те поля/параметры, которые нужны. Например, index.html?energy=10 даст награду вам на 10%;
8. Возможность использования в качестве средства платежей из эмиссии. Это достигается благодаря добавлению возможности ввода суммы награды в параметры/поля, а также просмотром суммы, которая получилась в результате.
9. Открытый код: Вы можете модефицировать проект, как хотите.
10. Две версии: Русская и Английская (Папки ru и en).

## Что дальше?
1. Заказ дизайна.
2. Избавление формы, создаваемой конструктором, от Jquery.

## Всё
Пользоваться awards-generator можно, используя https://viz.dpos.space/awards
Форма: https://viz.dpos.space/awards/ru/form.html
url имеют вид: index.html?target=denis-skripnik&energy=10

***

Автор сервиса: Денис Скрипник.
Профиль на viz.world: https://viz.world/@denis-skripnik/
Являюсь делегатом: https://viz.world/witnesses/denis-skripnik/ - ,буду рад вашим голосам.