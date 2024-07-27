import _ from 'lodash';
import { PartialDeep } from 'type-fest';

/**
 * The project model.
 */
const ProjectModel = (data: PartialDeep<any>) =>
	_.defaults(data || {}, {
		id: _.uniqueId('project-'),
		projectName: '',
		platformCd: 0,
		platformName: '',
		lakeName: '',
		lakeDesc: '',
		platformRegionSno: '',
		tagKey: '',
		tagValue: '',
		accessKey: '',
		secretAccessKey: '',
		businessURL: '',
		bronzeZone: '',
		silverZone: '',
		goldZone: '',
		logZone: '',
		quarantineZone: '',
		bronzeZoneStandard: 0,
		silverZoneStandard: 0,
		goldZoneStandard: 0,
		logZoneStandard: 0,
		quarantineZoneStandard: 0,
		quarantineZoneArchive: 0,
		platformRegionName:'',
		bronzeZoneArchive: 0,
		silverZoneArchive: 0,
		goldZoneArchive: 0,
		logZoneArchive: 0,
		platformAccessCd: 0,
		environmentCd: 0,
		environmentName: ''
	});

export default ProjectModel;
