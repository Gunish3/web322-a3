// modules/projects.js

require('dotenv').config();

require('pg');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

let sequelize = new Sequelize(
  process.env.PGDATABASE,   // database
  process.env.PGUSER,       // user
  process.env.PGPASSWORD,   // password
  {
    host: process.env.PGHOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  }
);

const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  feature_img_url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  summary_short: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  intro_short: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  impact: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  original_source_url: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject("Unable to sync the database: " + err);
      });
  });
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector]
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("No projects found");
        }
      })
      .catch(err => {
        reject("Unable to retrieve projects: " + err);
      });
  });
}
function getAllSectors() {
  return new Promise((resolve, reject) => {
    Sector.findAll({
      order: ['id']
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("No sectors found");
        }
      })
      .catch(err => {
        reject("Unable to retrieve sectors: " + err);
      });
  });
}
function addProject(projectData) {
  return new Promise((resolve, reject) => {
    // ensure sector_id is a number
    if (projectData.sector_id) {
      projectData.sector_id = parseInt(projectData.sector_id);
    }

    Project.create(projectData)
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject("Unable to add project: " + err);
      });
  });
}
function editProject(id, projectData) {
  return new Promise((resolve, reject) => {
    Project.update(
      {
        title: projectData.title,
        feature_img_url: projectData.feature_img_url,
        summary_short: projectData.summary_short,
        intro_short: projectData.intro_short,
        impact: projectData.impact,
        original_source_url: projectData.original_source_url,
        sector_id: projectData.sector_id
      },
      {
        where: { id: id }
      }
    )
      .then(() => {
        resolve();
      })
      .catch(err => {
        if (err && err.errors && err.errors.length > 0) {
          reject(err.errors[0].message);
        } else {
          reject("Error updating project");
        }
      });
  });
}



function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: { id: projectId }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data[0]);   // first (and only) result
        } else {
          reject("Unable to find requested project");
        }
      })
      .catch(err => {
        reject("Unable to retrieve project: " + err);
      });
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        '$Sector.sector_name$': {
          [Op.iLike]: `%${sector}%`
        }
      }
    })
      .then(data => {
        if (data.length > 0) {
          resolve(data);
        } else {
          reject("Unable to find requested projects");
        }
      })
      .catch(err => {
        reject("Unable to retrieve projects: " + err);
      });
  });
}
function deleteProject(id) {
  return new Promise((resolve, reject) => {
    Project.destroy({
      where: { id: id }
    })
      .then((rowsDeleted) => {
        if (rowsDeleted > 0) {
          resolve();
        } else {
          reject("No project found to delete");
        }
      })
      .catch((err) => {
        if (err && err.errors && err.errors.length > 0) {
          reject(err.errors[0].message);
        } else {
          reject("Error deleting project");
        }
      });
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};
