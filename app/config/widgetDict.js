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
        'Purpose',
        'Permission',
        dataType['en-US'],
        'Action'
    ],
    "es-ES": [
        'Contexto',
        'Consentimiento',
        dataType['es-ES'],
        'Accion'
    ]
};

export const dataTableDict = {
    "en-US": [
        dataType['en-US'],
        'Justification',
        'Basis of Processing',
        'Action'
    ],
    "es-ES": [
        dataType['es-ES'],
        'Justificante (Definicion del consentimiento)',
        'Base de Procesamiento',
        'Acción'
    ]
};

export const dataTableDict2 = {
    "en-US": [
        dataType['en-US'],
        "Where it's used",
        'Action'
    ],
    "es-ES": [
        dataType['es-ES'],
        'Donde es utilizado',
        'Accion'
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