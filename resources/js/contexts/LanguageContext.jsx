import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    en: {
        nav: {
            dashboard: 'Dashboard',
            patients: 'Patients',
            statistics: 'Statistics',
            reports: 'Reports',
            search: 'Search',
            facilities: 'Facilities',
            locations: 'Locations',
            logout: 'Logout',
            profile: 'Profile',
            language: 'Language'
        },
        common: {
            save: 'Save',
            cancel: 'Cancel',
            edit: 'Edit',
            delete: 'Delete',
            view: 'View',
            search: 'Search',
            filter: 'Filter',
            export: 'Export',
            loading: 'Loading...',
            noData: 'No data available',
            yes: 'Yes',
            no: 'No',
            male: 'Male',
            female: 'Female',
            select: 'Select',
            submit: 'Submit',
            actions: 'Actions',
            back: 'Back',
            total: 'Total',
            name: 'Name',
            date: 'Date',
            status: 'Status',
            phone: 'Phone',
            address: 'Address'
        },
        patient: {
            register: 'Register Patient',
            womanName: "Woman's Full Name",
            age: 'Age',
            literacyStatus: 'Can Read/Write?',
            literate: 'Yes (Literate)',
            nonLiterate: 'No (Non-literate)',
            phoneNumber: 'Phone Number',
            preferredLanguage: 'Preferred Language',
            husbandName: "Husband's Name",
            husbandPhone: "Husband's Phone",
            address: 'Residential Address',
            community: 'Community',
            lga: 'LGA',
            ward: 'Ward',
            gravida: 'Gravida (Total Pregnancies)',
            parity: 'Parity (Past Births)',
            pregnancyWeeks: 'Pregnancy Age (Weeks)',
            registrationDate: 'Registration Date',
            edd: 'Expected Delivery Date',
            fpInterest: 'Interested in Family Planning?',
            bloodPressure: 'Blood Pressure',
            weight: 'Weight (kg)',
            height: 'Height (cm)',
            bloodGroup: 'Blood Group',
            bloodLevel: 'Blood Level (g/dL)'
        },
        anc: {
            title: 'Antenatal Care',
            visit: 'ANC Visit',
            visitDate: 'Visit Date',
            recordVisit: 'Record ANC Visit'
        },
        delivery: {
            title: 'Delivery',
            dateOfDelivery: 'Date of Delivery',
            placeOfDelivery: 'Place of Delivery',
            typeOfDelivery: 'Type of Delivery',
            outcome: 'Delivery Outcome',
            liveBirth: 'Live birth',
            stillbirth: 'Stillbirth',
            motherAlive: 'Mother Alive',
            motherStatus: 'Mother Status'
        },
        immunization: {
            title: 'Child Immunization',
            childName: "Child's Name",
            childDob: 'Date of Birth',
            childSex: 'Sex'
        },
        dashboard: {
            totalPatients: 'Total Patients',
            ancCoverage: 'ANC Coverage',
            facilityDeliveries: 'Facility Deliveries',
            immunizationRate: 'Immunization Rate',
            fpUptake: 'FP Uptake',
            overview: 'Overview'
        },
        familyPlanning: {
            title: 'Family Planning',
            newAcceptor: 'New Acceptor',
            revisit: 'Revisit'
        }
    },
    ha: {
        nav: {
            dashboard: 'Shafin Gaba',
            patients: 'Majinyata',
            statistics: 'Kididdiga',
            reports: 'Rahotanni',
            search: 'Bincike',
            facilities: 'Wuraren Kiwon Lafiya',
            locations: 'Wurare',
            logout: 'Fita',
            profile: 'Bayani',
            language: 'Harshe'
        },
        common: {
            save: 'Ajiye',
            cancel: 'Soke',
            edit: 'Gyara',
            delete: 'Share',
            view: 'Duba',
            search: 'Bincike',
            filter: 'Tace',
            export: 'Fitar',
            loading: 'Ana lodawa...',
            noData: 'Babu bayani',
            yes: 'Eh',
            no: "A'a",
            male: 'Namiji',
            female: 'Mace',
            select: 'Zabi',
            submit: 'Tura',
            actions: 'Ayyuka',
            back: 'Koma',
            total: 'Jimlar',
            name: 'Suna',
            date: 'Kwanan wata',
            status: 'Matsayi',
            phone: 'Waya',
            address: 'Adireshi'
        },
        patient: {
            register: 'Rijistar Majinyaci',
            womanName: 'Sunan Mace',
            age: 'Shekaru',
            literacyStatus: 'Iya Karatu/Rubutu?',
            literate: 'Eh (Mai karatu)',
            nonLiterate: "A'a (Marar karatu)",
            phoneNumber: 'Lambar Waya',
            preferredLanguage: 'Harshen da ake so',
            husbandName: 'Sunan Miji',
            husbandPhone: 'Wayar Miji',
            address: 'Adireshi',
            community: 'Al umma',
            lga: 'LGA',
            ward: 'Unguwa',
            gravida: 'Cikinkuwa (Jimlar ciki)',
            parity: 'Haihuwa (Haihuwar baya)',
            pregnancyWeeks: 'Shekarun Ciki (Makonni)',
            registrationDate: 'Ranar Rijista',
            edd: 'Ranar Haihuwa',
            fpInterest: 'Ana son Tsarin Iyali?',
            bloodPressure: 'Matsin Jini',
            weight: 'Nauyi (kg)',
            height: 'Tsawo (cm)',
            bloodGroup: 'Rukunin Jini',
            bloodLevel: 'Matakin Jini (g/dL)'
        },
        anc: {
            title: 'Kula da Ciki',
            visit: 'Ziyarar ANC',
            visitDate: 'Ranar Ziyara',
            recordVisit: 'Rubuta Ziyarar ANC'
        },
        delivery: {
            title: 'Haihuwa',
            dateOfDelivery: 'Ranar Haihuwa',
            placeOfDelivery: 'Wurin Haihuwa',
            typeOfDelivery: 'Nau in Haihuwa',
            outcome: 'Sakamakon Haihuwa',
            liveBirth: 'Haihuwa mai rai',
            stillbirth: 'Haihuwa marar rai',
            motherAlive: 'Uwa tana da rai',
            motherStatus: 'Halin Uwa'
        },
        immunization: {
            title: 'Allurar Yara',
            childName: 'Sunan Yaro',
            childDob: 'Ranar Haihuwa',
            childSex: 'Jinsi'
        },
        dashboard: {
            totalPatients: 'Jimlar Majinyata',
            ancCoverage: 'Rufe ANC',
            facilityDeliveries: 'Haihuwa a Asibiti',
            immunizationRate: 'Adadin Allura',
            fpUptake: 'Amfanin FP',
            overview: 'Bayanin Gaba'
        },
        familyPlanning: {
            title: 'Tsarin Iyali',
            newAcceptor: 'Sabon Mai Karba',
            revisit: 'Sake Ziyara'
        }
    },
    yo: {
        nav: {
            dashboard: 'Dasibodu',
            patients: 'Awon Alaisan',
            statistics: 'Awon Iwe',
            reports: 'Ijabọ',
            search: 'Wa',
            facilities: 'Ile-iwosan',
            locations: 'Awon Ibi',
            logout: 'Jade',
            profile: 'Akoonu',
            language: 'Ede'
        },
        common: {
            save: 'Fi Pamo',
            cancel: 'Fagile',
            edit: 'Ṣatunṣe',
            delete: 'Pa re',
            view: 'Wo',
            search: 'Wa',
            filter: 'Se',
            export: 'Gbe Jade',
            loading: 'N gbe...',
            noData: 'Ko si data',
            yes: 'Beeni',
            no: 'Beeko',
            male: 'Okunrin',
            female: 'Obinrin',
            select: 'Yan',
            submit: 'Fi ranṣe',
            actions: 'Awon iṣe',
            back: 'Pada',
            total: 'Apapọ',
            name: 'Orukọ',
            date: 'Ojo',
            status: 'Ipo',
            phone: 'Foonu',
            address: 'Adiresi'
        },
        patient: {
            register: 'Forukọsilẹ Alaisan',
            womanName: 'Orukọ Obinrin',
            age: 'Ojo-ori',
            literacyStatus: 'Ṣe o le ka/kọ?',
            literate: 'Beeni (Oluka)',
            nonLiterate: 'Beeko (Alaika)',
            phoneNumber: 'Nọmba Foonu',
            preferredLanguage: 'Ede ti a fe',
            husbandName: 'Orukọ Ọkọ',
            husbandPhone: 'Foonu Ọkọ',
            address: 'Adiresi',
            community: 'Agbegbe',
            lga: 'LGA',
            ward: 'Agbegbe kekere',
            gravida: 'Oyun (Gbogbo oyun)',
            parity: 'Ibimọ (Ibimọ to kọja)',
            pregnancyWeeks: 'Ọjọ-ori Oyun (Ọsẹ)',
            registrationDate: 'Ọjọ Iforukọsilẹ',
            edd: 'Ọjọ Ibimọ ti a ṣe eto',
            fpInterest: 'Nife ni Eto Idile?',
            bloodPressure: 'Titẹ Ẹjẹ',
            weight: 'Iwuwo (kg)',
            height: 'Giga (cm)',
            bloodGroup: 'Iru Ẹjẹ',
            bloodLevel: 'Ipele Ẹjẹ (g/dL)'
        },
        anc: {
            title: 'Itọju Ṣaaju Ibimọ',
            visit: 'Abẹwo ANC',
            visitDate: 'Ọjọ Abẹwo',
            recordVisit: 'Gbasilẹ Abẹwo ANC'
        },
        delivery: {
            title: 'Ibimọ',
            dateOfDelivery: 'Ọjọ Ibimọ',
            placeOfDelivery: 'Ibi Ibimọ',
            typeOfDelivery: 'Iru Ibimọ',
            outcome: 'Abajade Ibimọ',
            liveBirth: 'Ibimọ laaye',
            stillbirth: 'Ibimọ ti ko laaye',
            motherAlive: 'Iya wa laaye',
            motherStatus: 'Ipo Iya'
        },
        immunization: {
            title: 'Ajesara Ọmọ',
            childName: 'Orukọ Ọmọ',
            childDob: 'Ọjọ Ibimọ',
            childSex: 'Akoirinrin'
        },
        dashboard: {
            totalPatients: 'Gbogbo Awon Alaisan',
            ancCoverage: 'Iṣẹ ANC',
            facilityDeliveries: 'Ibimọ ni Ile-iwosan',
            immunizationRate: 'Iye Ajesara',
            fpUptake: 'Lilo FP',
            overview: 'Akojọpọ'
        },
        familyPlanning: {
            title: 'Eto Idile',
            newAcceptor: 'Olugba Tuntun',
            revisit: 'Pada Abẹwo'
        }
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('app_language') || 'en';
        }
        return 'en';
    });

    useEffect(() => {
        localStorage.setItem('app_language', language);
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    const changeLanguage = (lang) => {
        if (['en', 'ha', 'yo'].includes(lang)) {
            setLanguage(lang);
        }
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
        { code: 'yo', name: 'Yoruba', flag: '🇳🇬' }
    ];

    return (
        <LanguageContext.Provider value={{ language, t, changeLanguage, languages }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

export const LanguageSelector = ({ className = '' }) => {
    const { language, changeLanguage, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === language);

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border hover:bg-gray-50 transition-colors"
                aria-label="Select language"
            >
                <span>{currentLang?.flag}</span>
                <span className="font-medium">{currentLang?.name}</span>
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                changeLanguage(lang.code);
                                setIsOpen(false);
                            }}
                            className={`w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                                language === lang.code ? 'bg-emerald-50 text-emerald-700' : ''
                            }`}
                        >
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageContext;
