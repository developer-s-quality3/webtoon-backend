const {
  User,
  Work,
  Episode,
  EpisodeImage,
  GenreType,
  Genre,
  Sequelize,
} = require('../models');

const createWork = async (req, res) => {
  const parsedData = JSON.parse(req.body.workInfo);

  const { title, workDescription } = parsedData;

  try {
    const work = await Work.create({
      userId: req.user.userId,
      title,
      workThumbnail: req.file.location,
      workDescription,
      status: 'pending',
    });
    const genreType = await GenreType.create({
      genreId: parsedData.genreId,
      workId: work.id,
    });
    return res.send({ work, genreType });
  } catch (error) {
    throw new Error(error.message);
  }
};

// 작가 홈
const getAllWorks = async (req, res) => {
  try {
    const works = await Work.findAll({
      where: { userId: req.user.userId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [
            'authorName',
            'authorDescription',
            'authorAvatar',
            'authorBanner',
          ],
        },
      ],
    });
    return res.send(works);
  } catch (error) {
    throw new Error(error.message);
  }
};

// 작가 홈의 에피소드 리스트
const getAllEpisodesFromWriterHome = async (req, res) => {
  const { workId } = req.params;

  try {
    const episodes = await Work.findOne({
      where: { id: workId, userId: req.user.userId },
      include: [
        {
          model: Episode,
          as: 'episode',
        },

        {
          model: GenreType,
          as: 'genreType',
          include: [{ model: Genre, as: 'genre' }],
        },
      ],
      attributes: [
        'id',
        'status',
        'title',
        'workThumbnail',
        'workDescription',
        'createdAt',
        'updatedAt',
        [
          Sequelize.literal(
            `(SELECT COUNT(*) FROM Episodes WHERE Episodes.workId = Work.id)`
          ),
          'episodeCounts',
        ],
      ],
      order: [[{ model: Episode, as: 'episode' }, 'episodeOrder', 'desc']],
    });
    return res.send(episodes);
  } catch (error) {
    throw new Error(error.message);
  }
};

// 작품id, 작품제목
const getWorksForCreateEpisode = async (req, res) => {
  const { userId } = req.user;

  try {
    const works = await Work.findAll({
      where: { userId },
      attributes: ['id', 'title'],
    });
    return res.send(works);
  } catch (error) {
    throw new Error(error.message);
  }
};

// 에피소드 등록할때 episodeOrder 보내주기
const getEpisodeOrderNumber = async (req, res) => {
  const { workId } = req.params;

  try {
    const work = await Work.findOne({
      where: { id: workId },
      include: [{ model: Episode, as: 'episode' }],
      order: [[{ model: Episode, as: 'episode' }, 'episodeOrder', 'desc']],
    });
    if (!work.episode.length) return res.send({ episodeOrder: 0 });
    return res.send(work.episode[0]);
  } catch (error) {
    throw new Error(error.message);
  }
};

const createEpisode = async (req, res) => {
  const parsedData = JSON.parse(req.body.episodeInfo);

  const { workId, episodeName, episodeDescription, episodeOrder } = parsedData;
  const { episodeThumbnail, episodeImages } = req.files;

  try {
    const episode = await Episode.create({
      workId,
      episodeName,
      episodeOrder,
      episodeDescription,
      episodeThumbnailUrl: episodeThumbnail[0].location,
    });

    const episodeImagesDatas = episodeImages.map((file) => {
      return {
        episodeId: episode.id,
        imageOrder: file.originalname.split('.')[0].split('_')[1],
        imageUrl: file.location,
      };
    });

    const uploadedEpisodeImages = await EpisodeImage.bulkCreate(
      episodeImagesDatas
    );
    return res.send(uploadedEpisodeImages);
  } catch (error) {
    throw new Error(error.message);
  }
};

const uploadEpisodeImages = async (req, res) => {
  const parsedData = JSON.parse(req.body.episodeImagesInfo);
  //console.log(req.files);
  const episodeImagesUrl = req.files.map((file) => file.location);

  try {
    // const episodesImages = await EpisodeImage.create({});
    res.send('test');
  } catch (error) {
    throw new Error(error.message);
  }
};

const uploadAuthorBanner = async (req, res) => {
  const { userId } = req.user;

  if (!req.file) return res.status(400).send('이미지를 찾을 수 없습니다');

  const authorBanner = req.file.location;

  try {
    const author = await User.update(
      { authorBanner },
      { where: { id: userId } }
    );
    return res.send(author);
  } catch (error) {
    throw new Error(error.message);
  }
};
//에피소드 섬네일, 작품명, 에피소드명,  상태, 요청날짜

// 11-28
// 관리자 - 홈 배너 추가 삭제 수정
// 작가 - 홈 배너 추가 삭제 수정
// 홈 - 작가명/작품명 검색
// 클릭시, 반려사유보내주기

// const getAllAppliedEpisodes

module.exports = {
  uploadEpisodeImages,
  createEpisode,
  getAllWorks,
  createWork,
  getWorksForCreateEpisode,
  getEpisodeOrderNumber,
  uploadAuthorBanner,
  getAllEpisodesFromWriterHome,
};
