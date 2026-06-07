const REQUIRED_FIELDS = ['id', 'name', 'group', 'perspective', 'camera', 'audio'];
const VALID_PERSPECTIVES = ['2d', '3d', 'mixed'];

export function fillDefaults(raw) {
    const desc = { ...raw };

    desc.camera = { ...raw.camera };
    if (desc.camera.orbitEnabled === undefined) {
        desc.camera.orbitEnabled = desc.perspective !== '2d';
    }
    if (desc.camera.animated === undefined)   desc.camera.animated = false;
    if (desc.camera.transition === undefined) desc.camera.transition = false;

    desc.audio = { ...raw.audio };
    if (desc.audio.usesFrequency === undefined)   desc.audio.usesFrequency = true;
    if (desc.audio.usesWaveform === undefined)    desc.audio.usesWaveform = false;
    if (desc.audio.frequencyFocus === undefined)  desc.audio.frequencyFocus = 'full';

    desc.params = {
        usesSpeed: true,
        usesPalette: true,
        usesBackground: true,
        ...(raw.params || {}),
    };

    if (!desc.style)      desc.style      = { tags: [] };
    if (!desc.layers)     desc.layers     = [];
    if (!desc.extensions) desc.extensions = {};

    return desc;
}

export function validate(descriptor) {
    const errors = [];
    const id = descriptor.id || '?';

    for (const field of REQUIRED_FIELDS) {
        if (descriptor[field] === undefined || descriptor[field] === null) {
            errors.push(`Missing required field: "${field}"`);
        }
    }

    if (descriptor.perspective && !VALID_PERSPECTIVES.includes(descriptor.perspective)) {
        errors.push(`Invalid perspective "${descriptor.perspective}". Must be one of: ${VALID_PERSPECTIVES.join(', ')}`);
    }

    if (!descriptor.camera?.preset) {
        errors.push('Missing camera.preset');
    }

    if (errors.length > 0) {
        errors.forEach(e => console.warn(`[VisualizerDescriptor] ${id}: ${e}`));
    }

    return { valid: errors.length === 0, errors };
}
