# bachelor-Kosyk | Тема роботи: Розроблення веб-застосунку для вивчення лексики іноземних мов з використанням технологій штучного інтелекту

## Автор роботи: Косик Маркіян Іванович

### Науковий керівник: Яковлєв Микола Костянтинович, Senior JavaScript Developer, Intellias

#### Опис проекту

Даний проект - це веб-застосунок для вивчення лексики іноземних мов, що використовує технології штучного інтелекту для розширення можливостей навчання.

Основний фокус роботи зосереджений на розробці та інтеграції наступних AI-компонентів:

1. **Оцінювання вимови:** Реалізація системи аналізу аудіо (на базі таких моделей як Wav2Vec), яка обробляє голосове введення користувача та надає оцінку правильності вимови слів або фраз.
2. **Генерування зображень:** Використання генеративних моделей штучного інтелекту для автоматичного створення унікальних візуальних асоціацій до нових слів, що значно полегшує процес запам'ятовування.
3. **Генерування історій (Fill-in-the-blank):** Створення вправ за допомогою мовних моделей. Система генерує історії з пропущеними словами, які користувач повинен заповнити правильною лексикою, опираючись на контекст.

4. Також окрема увага була приділена для terraform для створення інфраструктури проекту на AWS, її можна проглянути в папках: wordify-terraform-frontend, wordify-terraform-backend та wordify-terraform-ml.

#### Перелік використаних технологій:

![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![Stylus](https://img.shields.io/badge/stylus-%23ff6347.svg?style=for-the-badge&logo=stylus&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white) ![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Terraform](https://img.shields.io/badge/terraform-%235835CC.svg?style=for-the-badge&logo=terraform&logoColor=white) ![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white) ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white) ![GitLab](https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white) ![GitLab CI](https://img.shields.io/badge/gitlab%20CI-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white)

#### Інструкція для запуску

1. Скопіювати репозиторій:

```bash
git clone https://github.com/Markus-Lyachtuch/bachelor-Kosyk
```

2. Переконатися що встановлено node.js(не менше 20 версії), docker та postgres.

3. Запустити бекенд:

```bash
cd ./wordify-backend
```

4. Заповнити .env файли в корені проекту (для цього можна скопіювати .env.example)

5. Почати build та запустити контейнер:

```bash
docker build -t "wordify-backend" .
docker run -p 8080 "wordify-backend"
```

6. Запустити ML-модуль:

```bash
cd ./wordify-ml
```

7. Почати build та запустити контейнер:

```bash
docker build -t "wordify-ml" .
docker run -p 5000:8080 "wordify-ml"
```

8. Запустити фронтенд:

```bash
cd ./wordify-frontend
```

9. Встановити залежності:

```bash
npm i --legacy-peer-deps
```

10. Заповнити .env файли в корені проекту (для цього можна скопіювати .env.example)

11. Запустити фронтенд:

```bash
npm run dev
```
