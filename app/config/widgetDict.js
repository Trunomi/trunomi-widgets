let dataType = {
    "en-US": 'Personal Info',
    "es-ES": 'Tipo de Datos'
};

let customerID = {
    "en-US": 'Customer ID',
    "es-ES": 'Identificacion de usuario (ID)'
};

export const consentTableDict = {
    "en-US": [
        'What Data?',
        'What will it be used for?',
        'Status',
        'Actions'
    ],
    "es-ES": [
        'Contexto',
        'Consentimiento',
        dataType['es-ES'],
        'Permitido'
    ]
};

export const dataTableDict = {
    "en-US": [
        dataType['en-US'],
        'Justification',
        'Basis of Processing',
        'Actions'
    ],
    "es-ES": [
        dataType['es-ES'],
        'Justificante (Definicion del consentimiento)',
        'Base de Procesamiento',
        'Acciónes'
    ]
};

export const dataTableDict2 = {
    "en-US": [
        'What Data?',
        'What will it be used for?',
        'Legal Basis',
        'Action'
    ],
    "es-ES": [
        dataType['es-ES'],
        'Donde es utilizado',
        'Acción'
    ]
};


export const dsrTableDict = {
    "en-US": [
        'Request',
        dataType['en-US'],
        'Data Requested',
        'Status',
        'Note'
    ],
    "es-ES": [
        'Solicitud',
        dataType['es-ES'],
        'Datos Solicitados',
        'Estado',
        'Notas'
    ]
};

export const consentButtonDict = {
    "en-US": [
        'Yes',
        'No'
    ],
    "es-ES": [
        'Si',
        'No'
    ]
};

export const dsrButtonDict = {
    "en-US": [
        'Action',
        'Access',
        'Erase',
        'Rectify',
        'Object'
    ],
    "es-ES": [
        'Accion',
        'Acceso',
        'Borrar',
        'Rectificar',
        'Objetar'
    ]
};

export const submitButtonDict = {
    "en-US": [
        'Submit'
    ],
    "es-ES": [
        'Enviar'
    ]
};

export const closeButtonDict = {
    "en-US": [
        'Close'
    ],
    "es-ES": [
        'Cerrar'
    ]
};

export const trucertTableDict = {
    "en-US": [
        'Program',
        customerID['en-US'],
        'Personal Data Referenced',
        'Timestamp',
        'TruCert Fingerprint'
    ],
    "es-ES": [
        'Programa',
        customerID['es-ES'],
        'Referencia de datos personales',
        'Marca de tiempo',
        'Huella TruCert'
    ]
};

export const loadingDict = {
    "en-US": [
        'Loading'
    ],
    "es-ES": [
        'Cargando'
    ]
};