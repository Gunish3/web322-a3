const projects = [
    { id: 1, title: 'Solar Rooftops', sector: 'Electricity', summary_short: 'Add panels to roofs', intro_short: 'Intro text', impact: 'Cuts emissions', feature_img_url: 'https://picsum.photos/800/400?1', original_source_url: 'https://example.com' },
    { id: 2, title: 'EV Buses', sector: 'Transportation', summary_short: 'Electric buses in city', intro_short: 'Intro text', impact: 'Cleaner transit', feature_img_url: 'https://picsum.photos/800/400?2', original_source_url: 'https://example.com' },
  ];
  
  module.exports = {
    getAllProjects: async () => projects,
    getProjectsBySector: async (sector) => projects.filter(p => p.sector === sector),
    getProjectById: async (id) => {
      const p = projects.find(p => p.id === id);
      if (!p) throw 'Project not found';
      return p;
    }
  };
  