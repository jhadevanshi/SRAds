--
-- PostgreSQL database dump
--

\restrict sXfcdiwUVHLOIgBb0yNvALUbE8oMvqYXLjuVoT3Jd9iV1Sbgnw0L8fJ2Wc4qpaM

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ad_daily_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ad_daily_stats (
    id integer NOT NULL,
    ad_id integer,
    date date DEFAULT CURRENT_DATE NOT NULL,
    distance_km numeric(15,4) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ad_daily_stats_distance_km_check CHECK ((distance_km >= (0)::numeric))
);


ALTER TABLE public.ad_daily_stats OWNER TO postgres;

--
-- Name: ad_daily_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ad_daily_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ad_daily_stats_id_seq OWNER TO postgres;

--
-- Name: ad_daily_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ad_daily_stats_id_seq OWNED BY public.ad_daily_stats.id;


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_logs (
    id integer NOT NULL,
    admin_id integer,
    action character varying(100) NOT NULL,
    module character varying(100) NOT NULL,
    description text,
    ip_address character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_logs OWNER TO postgres;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_logs_id_seq OWNER TO postgres;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_logs_id_seq OWNED BY public.admin_logs.id;


--
-- Name: ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ads (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    advertiser_id integer,
    media_id integer,
    category character varying(100),
    ad_type character varying(50) DEFAULT 'GENERAL'::character varying NOT NULL,
    play_duration integer DEFAULT 15 NOT NULL,
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL,
    approval_status character varying(50) DEFAULT 'Pending'::character varying,
    budget numeric(15,2) DEFAULT 0,
    remaining_budget numeric(15,2) DEFAULT 0,
    cost_per_play numeric(15,2) DEFAULT 1,
    total_plays integer DEFAULT 0,
    total_spend numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approved_by integer,
    approved_at timestamp without time zone,
    rejection_reason text,
    video_trim_start integer DEFAULT 0,
    video_trim_end integer DEFAULT 0,
    CONSTRAINT ads_ad_type_check CHECK (((ad_type)::text = ANY ((ARRAY['GENERAL'::character varying, 'CAMPAIGN'::character varying])::text[]))),
    CONSTRAINT ads_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['Pending'::character varying, 'Approved'::character varying, 'Rejected'::character varying, 'Budget Exhausted'::character varying])::text[]))),
    CONSTRAINT ads_budget_check CHECK ((budget >= (0)::numeric)),
    CONSTRAINT ads_cost_per_play_check CHECK ((cost_per_play >= (0)::numeric)),
    CONSTRAINT ads_play_duration_check CHECK ((play_duration > 0)),
    CONSTRAINT ads_remaining_budget_check CHECK ((remaining_budget >= (0)::numeric)),
    CONSTRAINT ads_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Deleted'::character varying])::text[]))),
    CONSTRAINT ads_total_plays_check CHECK ((total_plays >= 0)),
    CONSTRAINT ads_total_spend_check CHECK ((total_spend >= (0)::numeric))
);


ALTER TABLE public.ads OWNER TO postgres;

--
-- Name: ads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ads_id_seq OWNER TO postgres;

--
-- Name: ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;


--
-- Name: advertisers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advertisers (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    owner_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    gst character varying(50),
    address text,
    area character varying(255),
    city character varying(100),
    state character varying(100),
    business_type character varying(100) DEFAULT 'General'::character varying,
    latitude numeric(10,8),
    longitude numeric(11,8),
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL,
    password_hash character varying(255),
    wallet_balance numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT advertisers_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT advertisers_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT advertisers_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Suspended'::character varying])::text[]))),
    CONSTRAINT advertisers_wallet_balance_check CHECK ((wallet_balance >= (0)::numeric))
);


ALTER TABLE public.advertisers OWNER TO postgres;

--
-- Name: advertisers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advertisers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advertisers_id_seq OWNER TO postgres;

--
-- Name: advertisers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advertisers_id_seq OWNED BY public.advertisers.id;


--
-- Name: campaign_ads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_ads (
    id integer NOT NULL,
    campaign_id integer,
    ad_id integer,
    play_order integer NOT NULL,
    duration integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT campaign_ads_duration_check CHECK ((duration > 0)),
    CONSTRAINT campaign_ads_play_order_check CHECK ((play_order >= 0))
);


ALTER TABLE public.campaign_ads OWNER TO postgres;

--
-- Name: campaign_ads_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_ads_id_seq OWNER TO postgres;

--
-- Name: campaign_ads_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_ads_id_seq OWNED BY public.campaign_ads.id;


--
-- Name: campaign_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaign_devices (
    id integer NOT NULL,
    campaign_id integer,
    device_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.campaign_devices OWNER TO postgres;

--
-- Name: campaign_devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaign_devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaign_devices_id_seq OWNER TO postgres;

--
-- Name: campaign_devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaign_devices_id_seq OWNED BY public.campaign_devices.id;


--
-- Name: campaigns; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.campaigns (
    id integer NOT NULL,
    campaign_name character varying(255) NOT NULL,
    advertiser_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    priority integer DEFAULT 1,
    budget numeric(15,2),
    area character varying(255),
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    approval_status character varying(50) DEFAULT 'Pending'::character varying,
    approved_by integer,
    approved_at timestamp without time zone,
    rejection_reason text,
    daily_budget numeric(15,2),
    start_time time without time zone DEFAULT '00:00:00'::time without time zone,
    end_time time without time zone DEFAULT '23:59:59'::time without time zone,
    CONSTRAINT campaigns_approval_status_check CHECK (((approval_status)::text = ANY ((ARRAY['Pending'::character varying, 'Approved'::character varying, 'Rejected'::character varying])::text[]))),
    CONSTRAINT campaigns_budget_check CHECK ((budget >= (0)::numeric)),
    CONSTRAINT campaigns_daily_budget_check CHECK ((daily_budget >= (0)::numeric)),
    CONSTRAINT campaigns_priority_check CHECK (((priority >= 1) AND (priority <= 10))),
    CONSTRAINT campaigns_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Paused'::character varying, 'Stopped'::character varying, 'Completed'::character varying])::text[]))),
    CONSTRAINT chk_campaign_dates CHECK ((end_date >= start_date))
);


ALTER TABLE public.campaigns OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.campaigns_id_seq OWNER TO postgres;

--
-- Name: campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.campaigns_id_seq OWNED BY public.campaigns.id;


--
-- Name: device_location_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_location_history (
    id integer NOT NULL,
    device_id integer,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    speed numeric(10,2),
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    distance_from_previous numeric(10,4) DEFAULT 0,
    is_gps_jump boolean DEFAULT false,
    CONSTRAINT device_location_history_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT device_location_history_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT device_location_history_speed_check CHECK ((speed >= (0)::numeric))
);


ALTER TABLE public.device_location_history OWNER TO postgres;

--
-- Name: device_location_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.device_location_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_location_history_id_seq OWNER TO postgres;

--
-- Name: device_location_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.device_location_history_id_seq OWNED BY public.device_location_history.id;


--
-- Name: device_registration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_registration (
    id integer NOT NULL,
    device_id integer,
    activation_key character varying(100) NOT NULL,
    activation_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    registered_by character varying(255),
    city character varying(100),
    state character varying(100),
    area character varying(255),
    installation_status character varying(50) DEFAULT 'Pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT device_registration_installation_status_check CHECK (((installation_status)::text = ANY ((ARRAY['Installed Successfully'::character varying, 'Pending'::character varying, 'Failed'::character varying])::text[])))
);


ALTER TABLE public.device_registration OWNER TO postgres;

--
-- Name: device_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.device_registration_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_registration_id_seq OWNER TO postgres;

--
-- Name: device_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.device_registration_id_seq OWNED BY public.device_registration.id;


--
-- Name: device_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_status_history (
    id integer NOT NULL,
    device_id integer,
    internet character varying(50),
    gps character varying(50),
    status character varying(50),
    battery_level integer,
    recorded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT device_status_history_battery_level_check CHECK (((battery_level >= 0) AND (battery_level <= 100))),
    CONSTRAINT device_status_history_gps_check CHECK (((gps)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Unknown'::character varying])::text[]))),
    CONSTRAINT device_status_history_internet_check CHECK (((internet)::text = ANY ((ARRAY['Connected'::character varying, 'Disconnected'::character varying, 'Unknown'::character varying])::text[]))),
    CONSTRAINT device_status_history_status_check CHECK (((status)::text = ANY ((ARRAY['Online'::character varying, 'Offline'::character varying, 'Disabled'::character varying])::text[])))
);


ALTER TABLE public.device_status_history OWNER TO postgres;

--
-- Name: device_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.device_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.device_status_history_id_seq OWNER TO postgres;

--
-- Name: device_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.device_status_history_id_seq OWNED BY public.device_status_history.id;


--
-- Name: devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.devices (
    id integer NOT NULL,
    adsd_id character varying(100) NOT NULL,
    serial_number character varying(100),
    device_name character varying(255) NOT NULL,
    vehicle_type character varying(50) NOT NULL,
    vehicle_number character varying(50),
    installation_date date,
    status character varying(50) DEFAULT 'Offline'::character varying NOT NULL,
    last_seen timestamp without time zone,
    heartbeat_at timestamp without time zone,
    last_ad_id integer,
    latitude numeric(10,8),
    longitude numeric(11,8),
    gps_status character varying(50) DEFAULT 'Unknown'::character varying,
    internet_status character varying(50) DEFAULT 'Unknown'::character varying,
    battery_level integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    total_distance_km numeric(15,2) DEFAULT 0,
    today_distance_km numeric(10,2) DEFAULT 0,
    last_distance_update date,
    location_updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    area character varying(255),
    installer_id integer,
    CONSTRAINT devices_battery_level_check CHECK (((battery_level >= 0) AND (battery_level <= 100))),
    CONSTRAINT devices_gps_status_check CHECK (((gps_status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Unknown'::character varying])::text[]))),
    CONSTRAINT devices_internet_status_check CHECK (((internet_status)::text = ANY ((ARRAY['Connected'::character varying, 'Disconnected'::character varying, 'Unknown'::character varying])::text[]))),
    CONSTRAINT devices_latitude_check CHECK (((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))),
    CONSTRAINT devices_longitude_check CHECK (((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))),
    CONSTRAINT devices_status_check CHECK (((status)::text = ANY ((ARRAY['Online'::character varying, 'Offline'::character varying, 'Disabled'::character varying])::text[]))),
    CONSTRAINT devices_today_distance_km_check CHECK ((today_distance_km >= (0)::numeric)),
    CONSTRAINT devices_total_distance_km_check CHECK ((total_distance_km >= (0)::numeric)),
    CONSTRAINT devices_vehicle_type_check CHECK (((vehicle_type)::text = ANY ((ARRAY['Auto'::character varying, 'BRTS'::character varying])::text[])))
);


ALTER TABLE public.devices OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.devices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.devices_id_seq OWNER TO postgres;

--
-- Name: devices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.devices_id_seq OWNED BY public.devices.id;


--
-- Name: driver_daily_stats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_daily_stats (
    id integer NOT NULL,
    driver_id integer,
    date date NOT NULL,
    distance_km numeric(10,2) DEFAULT 0,
    active_minutes numeric(10,2) DEFAULT 0,
    income numeric(10,2) DEFAULT 0,
    ads_played integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.driver_daily_stats OWNER TO postgres;

--
-- Name: driver_daily_stats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_daily_stats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.driver_daily_stats_id_seq OWNER TO postgres;

--
-- Name: driver_daily_stats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_daily_stats_id_seq OWNED BY public.driver_daily_stats.id;


--
-- Name: driver_payment_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_payment_methods (
    id integer NOT NULL,
    driver_id integer,
    account_holder character varying(255) NOT NULL,
    account_number character varying(100) NOT NULL,
    ifsc character varying(50) NOT NULL,
    bank_name character varying(255) NOT NULL,
    branch character varying(255),
    is_primary boolean DEFAULT false,
    status character varying(50) DEFAULT 'Pending Verification'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT driver_payment_methods_status_check CHECK (((status)::text = ANY ((ARRAY['Verified'::character varying, 'Pending Verification'::character varying, 'Rejected'::character varying])::text[])))
);


ALTER TABLE public.driver_payment_methods OWNER TO postgres;

--
-- Name: driver_payment_methods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_payment_methods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.driver_payment_methods_id_seq OWNER TO postgres;

--
-- Name: driver_payment_methods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_payment_methods_id_seq OWNED BY public.driver_payment_methods.id;


--
-- Name: driver_wallet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_wallet (
    id integer NOT NULL,
    driver_id integer,
    balance numeric(15,2) DEFAULT 0,
    distance_accumulator numeric(10,4) DEFAULT 0,
    last_lat numeric(10,8),
    last_lon numeric(11,8),
    last_update_time timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT driver_wallet_balance_check CHECK ((balance >= (0)::numeric)),
    CONSTRAINT driver_wallet_distance_accumulator_check CHECK ((distance_accumulator >= (0)::numeric))
);


ALTER TABLE public.driver_wallet OWNER TO postgres;

--
-- Name: driver_wallet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_wallet_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.driver_wallet_id_seq OWNER TO postgres;

--
-- Name: driver_wallet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_wallet_id_seq OWNED BY public.driver_wallet.id;


--
-- Name: driver_wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.driver_wallet_transactions (
    id integer NOT NULL,
    driver_id integer,
    amount numeric(15,2) NOT NULL,
    type character varying(50) NOT NULL,
    reason character varying(255) NOT NULL,
    distance_earned numeric(10,4),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT driver_wallet_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['Credit'::character varying, 'Debit'::character varying])::text[])))
);


ALTER TABLE public.driver_wallet_transactions OWNER TO postgres;

--
-- Name: driver_wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.driver_wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.driver_wallet_transactions_id_seq OWNER TO postgres;

--
-- Name: driver_wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.driver_wallet_transactions_id_seq OWNED BY public.driver_wallet_transactions.id;


--
-- Name: drivers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.drivers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(20) NOT NULL,
    password_hash character varying(255) NOT NULL,
    vehicle_type character varying(50),
    vehicle_number character varying(50),
    status character varying(50) DEFAULT 'Active'::character varying,
    device_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255),
    profile_photo character varying(255),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT drivers_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Suspended'::character varying])::text[])))
);


ALTER TABLE public.drivers OWNER TO postgres;

--
-- Name: drivers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.drivers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.drivers_id_seq OWNER TO postgres;

--
-- Name: drivers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.drivers_id_seq OWNED BY public.drivers.id;


--
-- Name: installers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.installers (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    phone character varying(50),
    email character varying(255),
    status character varying(50) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.installers OWNER TO postgres;

--
-- Name: installers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.installers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.installers_id_seq OWNER TO postgres;

--
-- Name: installers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.installers_id_seq OWNED BY public.installers.id;


--
-- Name: media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.media (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    media_type character varying(50) NOT NULL,
    duration integer DEFAULT 15,
    resolution character varying(50),
    size bigint,
    uploaded_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    advertiser_id integer,
    thumbnail_url text,
    CONSTRAINT media_duration_check CHECK ((duration > 0)),
    CONSTRAINT media_media_type_check CHECK (((media_type)::text = ANY ((ARRAY['image'::character varying, 'video'::character varying])::text[]))),
    CONSTRAINT media_size_check CHECK ((size >= 0))
);


ALTER TABLE public.media OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.media_id_seq OWNER TO postgres;

--
-- Name: media_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'Unread'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_status_check CHECK (((status)::text = ANY ((ARRAY['Read'::character varying, 'Unread'::character varying])::text[]))),
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['Info'::character varying, 'Warning'::character varying, 'Error'::character varying, 'Success'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: playback_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playback_logs (
    id integer NOT NULL,
    device_id integer,
    campaign_id integer,
    ad_id integer,
    played_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    duration integer NOT NULL,
    playback_session_id character varying(255),
    amount numeric(15,2) DEFAULT 0,
    rate_per_second numeric(15,2) DEFAULT 0.20,
    advertiser_id integer,
    CONSTRAINT playback_logs_duration_check CHECK ((duration > 0))
);


ALTER TABLE public.playback_logs OWNER TO postgres;

--
-- Name: playback_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.playback_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playback_logs_id_seq OWNER TO postgres;

--
-- Name: playback_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.playback_logs_id_seq OWNED BY public.playback_logs.id;


--
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value character varying(255) NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    status character varying(50) DEFAULT 'Active'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Admin'::character varying, 'Super Admin'::character varying, 'Operator'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying, 'Suspended'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_transactions (
    id integer NOT NULL,
    advertiser_id integer,
    amount numeric(15,2) NOT NULL,
    type character varying(50) NOT NULL,
    reason character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    cashfree_order_id character varying(255),
    cashfree_payment_session_id character varying(255),
    status character varying(50) DEFAULT 'SUCCESS'::character varying,
    currency character varying(10) DEFAULT 'INR'::character varying,
    cashfree_payment_id character varying(255),
    payment_method character varying(50),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT wallet_transactions_type_check CHECK (((type)::text = ANY ((ARRAY['Credit'::character varying, 'Debit'::character varying])::text[])))
);


ALTER TABLE public.wallet_transactions OWNER TO postgres;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_transactions_id_seq OWNER TO postgres;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.wallet_transactions_id_seq OWNED BY public.wallet_transactions.id;


--
-- Name: ad_daily_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_daily_stats ALTER COLUMN id SET DEFAULT nextval('public.ad_daily_stats_id_seq'::regclass);


--
-- Name: admin_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_logs_id_seq'::regclass);


--
-- Name: ads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);


--
-- Name: advertisers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisers ALTER COLUMN id SET DEFAULT nextval('public.advertisers_id_seq'::regclass);


--
-- Name: campaign_ads id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_ads ALTER COLUMN id SET DEFAULT nextval('public.campaign_ads_id_seq'::regclass);


--
-- Name: campaign_devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_devices ALTER COLUMN id SET DEFAULT nextval('public.campaign_devices_id_seq'::regclass);


--
-- Name: campaigns id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns ALTER COLUMN id SET DEFAULT nextval('public.campaigns_id_seq'::regclass);


--
-- Name: device_location_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_location_history ALTER COLUMN id SET DEFAULT nextval('public.device_location_history_id_seq'::regclass);


--
-- Name: device_registration id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_registration ALTER COLUMN id SET DEFAULT nextval('public.device_registration_id_seq'::regclass);


--
-- Name: device_status_history id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_status_history ALTER COLUMN id SET DEFAULT nextval('public.device_status_history_id_seq'::regclass);


--
-- Name: devices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices ALTER COLUMN id SET DEFAULT nextval('public.devices_id_seq'::regclass);


--
-- Name: driver_daily_stats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_daily_stats ALTER COLUMN id SET DEFAULT nextval('public.driver_daily_stats_id_seq'::regclass);


--
-- Name: driver_payment_methods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payment_methods ALTER COLUMN id SET DEFAULT nextval('public.driver_payment_methods_id_seq'::regclass);


--
-- Name: driver_wallet id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet ALTER COLUMN id SET DEFAULT nextval('public.driver_wallet_id_seq'::regclass);


--
-- Name: driver_wallet_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.driver_wallet_transactions_id_seq'::regclass);


--
-- Name: drivers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers ALTER COLUMN id SET DEFAULT nextval('public.drivers_id_seq'::regclass);


--
-- Name: installers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installers ALTER COLUMN id SET DEFAULT nextval('public.installers_id_seq'::regclass);


--
-- Name: media id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: playback_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs ALTER COLUMN id SET DEFAULT nextval('public.playback_logs_id_seq'::regclass);


--
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wallet_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.wallet_transactions_id_seq'::regclass);


--
-- Data for Name: ad_daily_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ad_daily_stats (id, ad_id, date, distance_km, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_logs (id, admin_id, action, module, description, ip_address, created_at) FROM stdin;
1	1	Advertiser Deleted	Advertisers	Deleted advertiser: Test Business	\N	2026-07-31 16:26:30.691892
2	1	Advertiser Approved	Advertisers	Approved advertiser: Disha car	\N	2026-07-31 16:26:34.305094
3	1	Funds Added	Advertisers	Added ₹500 to Disha car	\N	2026-07-31 16:49:14.760551
4	1	Ad Approved	Ads	Approved ad: Test 	\N	2026-08-01 16:09:02.775401
5	1	Ad Approved	Ads	Approved ad: Test video	\N	2026-08-01 16:13:00.043927
6	1	Device Created	Devices	Created device: Auto (krish-001)	\N	2026-08-01 16:14:34.842642
7	1	Advertiser Updated	Advertisers	Updated advertiser: Disha cafe	\N	2026-08-02 00:24:15.542944
8	1	Device Created	Devices	Created device: suraj auto (suraj-002)	\N	2026-08-02 00:38:29.530493
9	1	Advertiser Updated	Advertisers	Updated advertiser: Disha cafe	\N	2026-08-02 01:14:57.220428
10	1	Advertiser Updated	Advertisers	Updated advertiser: Disha cafe	\N	2026-08-03 17:04:02.417299
11	1	Funds Added	Advertisers	Added ₹1000 to Disha cafe	\N	2026-08-03 17:26:35.369358
12	1	Advertiser Approved	Advertisers	Approved advertiser: Suraj cafe	\N	2026-08-08 01:23:03.474342
13	1	Funds Added	Advertisers	Added ₹1500 to Suraj cafe	\N	2026-08-08 01:23:21.085994
14	1	Ad Approved	Ads	Approved ad: Suraj test	\N	2026-08-08 14:26:16.584369
15	1	Ad Updated	Ads	Updated ad: Test video	\N	2026-08-15 11:14:46.136881
16	1	Campaign Updated	Campaigns	Updated campaign: Diwali offer 	\N	2026-08-15 11:15:38.636703
17	1	Ad Updated	Ads	Updated ad: Test 	\N	2026-08-15 12:21:00.682671
18	1	Advertiser Updated	Advertisers	Updated advertiser: Suraj cafe	\N	2026-08-20 11:43:37.910612
19	1	Media Deleted	Media	Deleted media: Suraj test	\N	2026-08-20 12:10:05.428916
20	1	Media Deleted	Media	Deleted media: Test video	\N	2026-08-20 12:10:07.974067
21	1	Media Deleted	Media	Deleted media: Test 	\N	2026-08-20 12:10:10.143516
22	1	Media Uploaded	Media	Uploaded media: cafe_ad	\N	2026-08-20 12:11:17.533383
23	1	Media Uploaded	Media	Uploaded media: GYM	\N	2026-08-20 12:12:45.516306
24	1	Ad Created	Ads	Created ad: GYM	\N	2026-08-20 12:14:42.593261
25	1	Ad Created	Ads	Created ad: CAFE	\N	2026-08-20 12:15:01.678239
26	1	Ad Approved	Ads	Approved ad: CAFE	\N	2026-08-20 12:15:11.753561
27	1	Ad Approved	Ads	Approved ad: GYM	\N	2026-08-20 12:15:13.286216
28	1	Media Uploaded	Media	Uploaded media: Test	\N	2026-08-20 13:41:39.120067
29	1	Ad Created	Ads	Created ad: Navrangpura_test	\N	2026-08-20 13:42:03.269663
30	1	Ad Approved	Ads	Approved ad: Navrangpura_test	\N	2026-08-20 13:42:05.847454
31	1	Ad Updated	Ads	Updated ad: Navrangpura_test	\N	2026-08-20 13:42:16.476823
32	1	Funds Added	Advertisers	Added ₹20000 to Disha cafe	\N	2026-08-20 13:47:34.027466
33	1	Campaign Deleted	Campaigns	Deleted campaign: Diwali offer 	\N	2026-08-20 13:53:48.772962
34	1	Ad Approved	Ads	Approved ad: 20% off offer 	\N	2026-08-23 15:47:16.79234
35	1	Advertiser Deleted	Advertisers	Deleted advertiser: Disha cafe	\N	2026-08-23 16:48:31.19834
36	1	Advertiser Approved	Advertisers	Approved advertiser: Shake Maker	\N	2026-08-23 16:48:35.892431
37	1	Ad Approved	Ads	Approved ad: Discount offer 	\N	2026-08-23 23:18:24.892477
38	1	Campaign Updated	Campaigns	Updated campaign: Discount offer  Campaign	\N	2026-08-23 23:29:01.169394
39	1	Campaign Updated	Campaigns	Updated campaign: Discount offer  Campaign	\N	2026-08-23 23:29:12.158713
40	1	Device Deleted	Devices	Deleted device: suraj auto	\N	2026-08-26 15:24:47.229686
41	1	Ad Approved	Ads	Approved ad: Hello disheee 	\N	2026-08-29 14:34:28.265736
42	1	Campaign Updated	Campaigns	Updated campaign: Hello disheee  Campaign	\N	2026-08-29 14:44:17.213252
43	1	Campaign Updated	Campaigns	Updated campaign: Discount offer  Campaign	\N	2026-08-29 14:44:34.602396
44	1	Media Deleted	Media	Deleted media: Ogt	\N	2026-08-29 14:49:09.283741
45	1	Media Uploaded	Media	Uploaded media: coxcred	\N	2026-08-29 14:49:24.910227
46	1	Ad Created	Ads	Created ad: coxcred	\N	2026-08-29 14:49:52.460757
47	1	Ad Approved	Ads	Approved ad: coxcred	\N	2026-08-29 14:49:54.73993
48	1	Advertiser Updated	Advertisers	Updated advertiser: Suraj cafe	\N	2026-08-29 15:22:09.011244
49	1	Media Deleted	Media	Deleted media: 20% off offer 	\N	2026-08-29 15:24:34.5232
50	1	Media Deleted	Media	Deleted media: Test	\N	2026-08-29 15:24:46.312656
51	1	Media Deleted	Media	Deleted media: Discount offer 	\N	2026-08-29 15:24:54.387165
52	1	Media Deleted	Media	Deleted media: GYM	\N	2026-08-29 15:25:00.806457
53	1	Ad Created	Ads	Created ad: test	\N	2026-08-29 15:33:37.293011
54	1	Ad Approved	Ads	Approved ad: test	\N	2026-08-29 15:33:39.741474
55	1	Advertiser Updated	Advertisers	Updated advertiser: Shake Maker	\N	2026-08-29 15:36:18.547988
56	1	Campaign Approved	Campaigns	Approved campaign: Hello disheee  Campaign	\N	2026-08-29 15:45:54.108176
57	1	Campaign Approved	Campaigns	Approved campaign: Discount offer  Campaign	\N	2026-08-29 15:45:55.365495
58	1	Campaign Deleted	Campaigns	Deleted campaign: Discount offer  Campaign	\N	2026-08-29 17:09:25.773405
59	1	Ad Updated	Ads	Updated ad: Hello disheee 	\N	2026-08-29 17:09:52.72982
60	1	Advertiser Updated	Advertisers	Updated advertiser: Shake Maker	\N	2026-08-29 17:12:34.844016
61	1	Ad Approved	Ads	Approved ad: Haaaha	\N	2026-08-29 17:15:20.414854
62	1	Campaign Approved	Campaigns	Approved campaign: Haaaha Campaign	\N	2026-08-29 17:16:08.027859
63	1	Ad Updated	Ads	Updated ad: Hello disheee 	\N	2026-08-30 13:02:18.73603
64	1	Ad Approved	Ads	Approved ad: Rakhi 	\N	2026-08-30 13:04:10.061631
65	1	Ad Updated	Ads	Updated ad: coxcred	\N	2026-08-30 13:04:24.17126
66	1	Campaign Deleted	Campaigns	Deleted campaign: Rakhi  Campaign	\N	2026-08-30 16:28:32.115036
67	1	Campaign Deleted	Campaigns	Deleted campaign: Rakhi  Campaign	\N	2026-08-30 16:28:36.739889
68	1	Campaign Approved	Campaigns	Approved campaign: Haaaha Campaign	\N	2026-08-30 16:35:00.162071
69	1	Login	Authentication	User logged in	127.0.0.1	2026-09-05 22:50:05.063404
70	1	Advertiser Updated	Advertisers	Updated advertiser: Shake Maker	\N	2026-09-05 22:51:03.157746
71	1	Campaign Deleted	Campaigns	Deleted campaign: Haaaha Campaign	\N	2026-09-06 12:45:00.652609
72	1	Campaign Deleted	Campaigns	Deleted campaign: Haaaha Campaign	\N	2026-09-06 12:45:03.217234
73	1	Campaign Deleted	Campaigns	Deleted campaign: Hello disheee  Campaign	\N	2026-09-06 12:45:05.841696
74	1	Ad Deleted	Ads	Deleted ad: Rakhi 	\N	2026-09-06 12:45:12.17863
75	1	Ad Deleted	Ads	Deleted ad: Haaaha	\N	2026-09-06 12:45:14.680632
76	1	Ad Deleted	Ads	Deleted ad: test	\N	2026-09-06 12:45:17.31564
77	1	Ad Deleted	Ads	Deleted ad: coxcred	\N	2026-09-06 12:45:19.58614
78	1	Ad Deleted	Ads	Deleted ad: Hello disheee 	\N	2026-09-06 12:45:22.148262
79	1	Ad Approved	Ads	Approved ad: Test 	\N	2026-09-06 12:55:03.632041
80	1	Ad Deleted	Ads	Deleted ad: Test 	\N	2026-09-06 12:56:37.248811
81	1	Campaign Deleted	Campaigns	Deleted campaign: Test  Campaign	\N	2026-09-06 12:56:40.95916
82	1	Ad Approved	Ads	Approved ad: Test 	\N	2026-09-06 12:59:06.506357
83	1	Advertiser Updated	Advertisers	Updated advertiser: Shake Maker	\N	2026-09-06 13:10:49.844325
84	1	Media Deleted	Media	Deleted media: Test 	\N	2026-09-06 13:18:58.120787
85	1	Media Deleted	Media	Deleted media: Rakhi 	\N	2026-09-06 13:19:00.8048
86	1	Media Deleted	Media	Deleted media: Haaaha	\N	2026-09-06 13:19:02.752652
87	1	Media Deleted	Media	Deleted media: coxcred	\N	2026-09-06 13:19:04.969843
88	1	Media Deleted	Media	Deleted media: Hello disheee 	\N	2026-09-06 13:19:06.531634
89	1	Media Deleted	Media	Deleted media: cafe_ad	\N	2026-09-06 13:19:08.758286
90	1	Media Deleted	Media	Deleted media: Test 	\N	2026-09-06 13:23:20.629819
91	1	Ad Deleted	Ads	Deleted ad: SRAds Welcome	\N	2026-09-06 14:11:01.322969
92	1	Ad Approved	Ads	Approved ad: Test 	\N	2026-09-06 14:11:02.998742
93	1	Ad Approved	Ads	Approved ad: Test vid	\N	2026-09-06 17:16:39.546615
94	1	Ad Approved	Ads	Approved ad: Test	\N	2026-09-06 17:59:30.182574
\.


--
-- Data for Name: ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ads (id, title, advertiser_id, media_id, category, ad_type, play_duration, status, approval_status, budget, remaining_budget, cost_per_play, total_plays, total_spend, created_at, approved_by, approved_at, rejection_reason, video_trim_start, video_trim_end) FROM stdin;
22	Test vid	4	23	\N	GENERAL	31	Active	Approved	0.00	0.00	0.00	29	829.15	2026-09-06 16:50:18.48059	1	2026-09-06 17:16:39.543565	\N	0	31
23	Test	4	24	\N	GENERAL	30	Active	Approved	0.00	0.00	1.00	5	52.50	2026-09-06 17:56:12.744952	1	2026-09-06 17:59:30.180092	\N	0	30
\.


--
-- Data for Name: advertisers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advertisers (id, company_name, owner_name, email, phone, gst, address, area, city, state, business_type, latitude, longitude, status, password_hash, wallet_balance, created_at) FROM stdin;
3	Suraj cafe	Suraj mehata	suraj11@gmail.com	9725180689	\N	Gulbai tekra	\N	Ahmedabad	Gujarat	General	23.02153740	72.58005680	Active	$2a$10$vp8Pj75o/m7IucV70VOCq.h0xuvqGfSlm6oGkL.MTP3kbajfrrTEG	1500.00	2026-08-08 01:22:47.180749
4	Shake Maker	Suraj Mehta	suraj111@gmail.com	9876543219	\N	Navrangpura	\N	Ahmedabad	Gujarat	General	23.03599980	72.56434290	Active	$2a$10$TBaHahvGPDioFxMcqHKEaOLOT3UT6NLVHNV0YT/Sn7ebuLv/BrxFW	7505.25	2026-08-23 16:47:54.689678
\.


--
-- Data for Name: campaign_ads; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_ads (id, campaign_id, ad_id, play_order, duration, created_at) FROM stdin;
12	17	22	1	31	2026-09-06 16:51:32.985364
13	18	23	1	30	2026-09-06 17:59:32.218593
14	19	23	1	30	2026-09-06 18:09:26.71485
\.


--
-- Data for Name: campaign_devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaign_devices (id, campaign_id, device_id, created_at) FROM stdin;
\.


--
-- Data for Name: campaigns; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.campaigns (id, campaign_name, advertiser_id, start_date, end_date, priority, budget, area, status, created_at, updated_at, approval_status, approved_by, approved_at, rejection_reason, daily_budget, start_time, end_time) FROM stdin;
17	Test vid Campaign	4	2026-09-06	2026-09-06	1	1464.75	Navrangpura	Active	2026-09-06 16:51:32.985364	2026-09-06 16:51:32.985364	Approved	\N	\N	\N	0.00	16:50:00	18:00:00
18	Test Campaign	4	2026-09-06	2026-09-07	1	2520.00	Bopal, Navrangpura	Paused	2026-09-06 17:59:32.218593	2026-09-06 17:59:32.218593	Pending	\N	\N	\N	0.00	15:57:00	16:57:00
19	Test Campaign	4	2026-09-06	2026-09-07	1	7560.00	all	Paused	2026-09-06 18:09:26.71485	2026-09-06 18:09:26.71485	Pending	\N	\N	\N	0.00	17:07:00	20:07:00
\.


--
-- Data for Name: device_location_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_location_history (id, device_id, latitude, longitude, speed, recorded_at, distance_from_previous, is_gps_jump) FROM stdin;
1	1	23.03650000	72.56110000	\N	2026-08-01 16:51:13.988207	0.0000	f
2	1	23.03780000	72.55940000	\N	2026-08-01 16:51:19.069885	0.2262	t
3	1	23.03650000	72.56110000	\N	2026-08-01 16:52:04.451003	0.2262	f
4	1	23.03690000	72.56110000	\N	2026-08-01 16:52:09.548434	0.0445	f
5	1	23.02898950	72.62089230	\N	2026-08-02 00:23:35.643677	6.1815	t
6	1	23.02898910	72.62089230	\N	2026-08-02 00:23:55.713417	0.0000	f
7	1	23.02835710	72.62454140	\N	2026-08-02 00:24:15.77217	0.3800	t
8	1	23.02898910	72.62089230	\N	2026-08-02 00:24:35.758539	0.3800	t
9	1	23.02898810	72.62089210	\N	2026-08-02 00:25:06.802991	0.0001	f
10	1	23.02898810	72.62089210	\N	2026-08-02 00:25:06.838431	0.0000	f
11	1	23.02899030	72.62089680	\N	2026-08-02 00:25:28.034661	0.0005	f
12	1	23.02898830	72.62089220	\N	2026-08-02 00:25:48.059753	0.0005	f
13	1	23.02899010	72.62089880	\N	2026-08-02 00:26:08.011594	0.0007	f
14	1	23.02902140	72.62090040	\N	2026-08-02 00:26:28.100313	0.0035	f
15	1	23.02898830	72.62089220	\N	2026-08-02 00:26:48.057019	0.0038	f
16	1	23.02898810	72.62089210	\N	2026-08-02 00:27:08.114948	0.0000	f
17	1	23.02898900	72.62089240	\N	2026-08-02 00:27:28.069964	0.0001	f
18	1	23.02898790	72.62089200	\N	2026-08-02 00:27:48.140147	0.0001	f
19	1	23.02898940	72.62089230	\N	2026-08-02 00:28:08.248729	0.0002	f
20	1	23.02898780	72.62089190	\N	2026-08-02 00:28:28.149556	0.0002	f
21	1	23.02898780	72.62089180	\N	2026-08-02 00:28:48.203761	0.0000	f
22	1	23.02898800	72.62089200	\N	2026-08-02 00:29:08.246867	0.0000	f
23	1	23.02898910	72.62089230	\N	2026-08-02 00:29:28.24119	0.0001	f
24	1	23.02898880	72.62089230	\N	2026-08-02 00:29:48.219137	0.0000	f
25	1	23.02898830	72.62089220	\N	2026-08-02 00:30:08.238019	0.0001	f
26	1	23.02898940	72.62089240	\N	2026-08-02 00:30:28.226251	0.0001	f
27	1	23.02898800	72.62089200	\N	2026-08-02 00:30:48.278522	0.0002	f
28	1	23.02898950	72.62089230	\N	2026-08-02 00:31:08.42046	0.0002	f
29	1	23.02899720	72.62090100	\N	2026-08-02 00:31:28.393062	0.0012	f
30	1	23.02825920	72.62047590	\N	2026-08-02 00:31:48.322717	0.0929	f
31	1	23.02825920	72.62047590	\N	2026-08-02 00:32:15.161397	0.0000	f
32	1	23.02825920	72.62047590	\N	2026-08-02 00:32:45.148762	0.0000	f
33	1	23.02825920	72.62047590	\N	2026-08-02 00:32:45.323845	0.0000	f
34	1	23.02825920	72.62047590	\N	2026-08-02 00:33:15.183123	0.0000	f
35	1	23.02825920	72.62047590	\N	2026-08-02 00:33:45.378024	0.0000	f
36	1	23.02825920	72.62047590	\N	2026-08-02 00:33:45.415789	0.0000	f
37	1	23.02825920	72.62047590	\N	2026-08-02 00:34:15.308459	0.0000	f
38	1	23.02825920	72.62047590	\N	2026-08-02 00:34:45.366298	0.0000	f
39	1	23.02825920	72.62047590	\N	2026-08-02 00:34:45.414711	0.0000	f
40	1	23.02825920	72.62047590	\N	2026-08-02 00:35:15.581081	0.0000	f
41	1	23.02825920	72.62047590	\N	2026-08-02 00:35:45.34363	0.0000	f
42	1	23.02825920	72.62047590	\N	2026-08-02 00:35:45.458203	0.0000	f
43	1	23.02825920	72.62047590	\N	2026-08-02 00:36:15.381765	0.0000	f
44	1	23.02825920	72.62047590	\N	2026-08-02 00:36:45.543759	0.0000	f
45	1	23.02825920	72.62047590	\N	2026-08-02 00:36:45.569503	0.0000	f
46	1	23.02825920	72.62047590	\N	2026-08-02 00:37:15.553289	0.0000	f
47	1	23.02825920	72.62047590	\N	2026-08-02 00:37:45.660655	0.0000	f
48	1	23.02825920	72.62047590	\N	2026-08-02 00:37:45.697771	0.0000	f
49	1	23.02825920	72.62047590	\N	2026-08-02 00:38:15.634676	0.0000	f
50	1	23.02825920	72.62047590	\N	2026-08-02 00:38:45.73989	0.0000	f
51	1	23.02825920	72.62047590	\N	2026-08-02 00:38:45.796498	0.0000	f
52	1	23.02825920	72.62047590	\N	2026-08-02 00:39:15.767572	0.0000	f
1252	1	23.02825769	72.62092780	\N	2026-08-26 15:26:47.459322	5.8584	t
1282	1	23.03276000	72.54978760	\N	2026-08-29 14:31:57.478572	0.0000	f
55	1	23.02825920	72.62047590	\N	2026-08-02 00:39:45.879257	0.0000	f
1303	1	23.03276230	72.54978630	\N	2026-08-29 14:53:41.948325	0.0000	f
57	1	23.02825920	72.62047590	\N	2026-08-02 00:39:45.954016	0.0000	f
58	1	23.02825920	72.62047590	\N	2026-08-02 00:40:15.870235	0.0000	f
1305	1	23.03276230	72.54978630	\N	2026-08-29 14:53:42.178066	0.0000	f
1322	1	23.03276010	72.54876560	\N	2026-08-29 16:04:10.38655	0.0000	f
61	1	23.02825920	72.62047590	\N	2026-08-02 00:40:45.862667	0.0000	f
62	1	23.02825920	72.62047590	\N	2026-08-02 00:40:46.014981	0.0000	f
1323	1	23.03276010	72.54876560	\N	2026-08-29 16:04:10.469272	0.0000	f
64	1	23.02825920	72.62047590	\N	2026-08-02 00:41:15.893417	0.0000	f
1365	1	23.03244200	72.54913530	\N	2026-09-06 14:18:10.690879	0.0000	f
1393	1	23.03244200	72.54913530	\N	2026-09-06 17:03:44.982838	0.0000	f
67	1	23.02825920	72.62047590	\N	2026-08-02 00:41:45.986388	0.0000	f
1410	1	23.03244200	72.54913530	\N	2026-09-06 18:04:47.625939	0.0000	f
69	1	23.02825920	72.62047590	\N	2026-08-02 00:41:46.10735	0.0000	f
70	1	23.02825920	72.62047590	\N	2026-08-02 00:42:16.069205	0.0000	f
73	1	23.02825920	72.62047590	\N	2026-08-02 00:42:46.180133	0.0000	f
75	1	23.02825920	72.62047590	\N	2026-08-02 00:42:46.288893	0.0000	f
78	1	23.02825920	72.62047590	\N	2026-08-02 00:43:16.565008	0.0000	f
80	1	23.02825920	72.62047590	\N	2026-08-02 00:43:46.329954	0.0000	f
81	1	23.02825920	72.62047590	\N	2026-08-02 00:43:46.423675	0.0000	f
1253	1	23.02825769	72.62092780	\N	2026-08-26 15:26:47.473855	5.8584	t
1283	1	23.03276000	72.54978760	\N	2026-08-29 14:31:57.796972	0.0000	f
1284	1	23.03276000	72.54978760	\N	2026-08-29 14:32:27.530179	0.0000	f
1285	1	23.03276000	72.54978760	\N	2026-08-29 14:33:08.460055	0.0000	f
1304	1	23.03276230	72.54978630	\N	2026-08-29 14:53:42.146738	0.0000	f
1324	1	23.03276010	72.54876560	\N	2026-08-29 16:04:14.21349	0.0000	f
1326	1	23.03276010	72.54876560	\N	2026-08-29 16:04:14.341079	0.0000	f
1366	1	23.03244200	72.54913530	\N	2026-09-06 14:18:11.084259	0.0000	f
1367	1	23.03244200	72.54913530	\N	2026-09-06 14:18:11.101308	0.0000	f
1394	1	23.03352180	72.54913530	\N	2026-09-06 17:24:33.888895	0.0000	f
1411	1	23.03244200	72.54913530	\N	2026-09-06 18:04:47.663564	0.0000	f
206	1	23.02898780	72.62089190	\N	2026-08-02 01:29:53.365133	0.0915	f
207	1	23.02898780	72.62089190	\N	2026-08-02 01:29:53.459532	0.0000	f
208	1	23.02898780	72.62089190	\N	2026-08-02 01:30:23.339282	0.0000	f
209	1	23.02898780	72.62089190	\N	2026-08-02 01:30:27.079665	0.0000	f
210	1	23.02898780	72.62089190	\N	2026-08-02 01:30:53.345688	0.0000	f
212	1	23.03291800	72.55257900	\N	2026-08-03 17:05:13.526969	7.0042	t
211	1	23.03291800	72.55257900	\N	2026-08-03 17:05:13.530123	7.0042	t
213	1	23.03291800	72.55257900	\N	2026-08-03 17:05:29.485639	0.0000	f
214	1	23.03291800	72.55257900	\N	2026-08-03 17:05:50.261677	0.0000	f
215	1	23.03291800	72.55257900	\N	2026-08-03 17:06:10.591363	0.0000	f
216	1	23.03291800	72.55257900	\N	2026-08-03 17:06:30.275251	0.0000	f
222	1	23.03291800	72.55257900	\N	2026-08-03 17:08:29.347168	0.0000	f
1223	1	23.03600000	72.56430000	\N	2026-08-20 14:28:55.81673	0.0000	f
1229	1	23.03600000	72.56430000	\N	2026-08-20 14:34:28.134859	0.0000	f
1230	1	23.03600000	72.56430000	\N	2026-08-20 14:34:31.353978	0.0000	f
1254	1	23.02825769	72.62092780	\N	2026-08-26 15:27:45.272812	0.0000	f
1286	1	23.03276000	72.54978760	\N	2026-08-29 14:33:08.508905	0.0000	f
1289	1	23.03276000	72.54978760	\N	2026-08-29 14:34:08.247465	0.0000	f
1306	1	23.03276230	72.54978630	\N	2026-08-29 15:23:02.45417	0.0000	f
1308	1	23.03276230	72.54978630	\N	2026-08-29 15:23:10.271823	0.0000	f
1325	1	23.03276010	72.54876560	\N	2026-08-29 16:04:14.330396	0.0000	f
1368	1	23.03244200	72.54913530	\N	2026-09-06 14:45:22.715426	0.0000	f
1395	1	23.03352180	72.54913530	\N	2026-09-06 17:24:33.957763	0.0000	f
217	1	23.03291800	72.55257900	\N	2026-08-03 17:06:50.31915	0.0000	f
218	1	23.03291800	72.55257900	\N	2026-08-03 17:07:10.223922	0.0000	f
219	1	23.03291800	72.55257900	\N	2026-08-03 17:07:30.575712	0.0000	f
220	1	23.03291800	72.55257900	\N	2026-08-03 17:07:50.393494	0.0000	f
221	1	23.03291800	72.55257900	\N	2026-08-03 17:08:09.680645	0.0000	f
223	1	23.03291800	72.55257900	\N	2026-08-03 17:08:49.339338	0.0000	f
224	1	23.03291800	72.55257900	\N	2026-08-03 17:09:09.979425	0.0000	f
225	1	23.03291800	72.55257900	\N	2026-08-03 17:09:31.868364	0.0000	f
226	1	23.03291800	72.55257900	\N	2026-08-03 17:09:52.640658	0.0000	f
227	1	23.03291800	72.55257900	\N	2026-08-03 17:10:09.410078	0.0000	f
228	1	23.03291800	72.55257900	\N	2026-08-03 17:10:30.359545	0.0000	f
229	1	23.03259900	72.55246500	\N	2026-08-03 17:10:49.390812	0.0373	f
230	1	23.03259900	72.55246500	\N	2026-08-03 17:10:49.446269	0.0373	f
231	1	23.03259900	72.55246500	\N	2026-08-03 17:10:56.455502	0.0000	f
232	1	23.03259900	72.55246500	\N	2026-08-03 17:10:56.460752	0.0000	f
233	1	23.03259900	72.55246500	\N	2026-08-03 17:11:16.44806	0.0000	f
234	1	23.03259900	72.55246500	\N	2026-08-03 17:11:37.319815	0.0000	f
235	1	23.03259900	72.55246500	\N	2026-08-03 17:11:56.477288	0.0000	f
236	1	23.03259900	72.55246500	\N	2026-08-03 17:12:17.758235	0.0000	f
237	1	23.03259900	72.55246500	\N	2026-08-03 17:12:36.574325	0.0000	f
238	1	23.03259900	72.55246500	\N	2026-08-03 17:12:56.478033	0.0000	f
239	1	23.03259900	72.55246500	\N	2026-08-03 17:13:16.464456	0.0000	f
240	1	23.03259900	72.55246500	\N	2026-08-03 17:13:37.091733	0.0000	f
241	1	23.03259900	72.55246500	\N	2026-08-03 17:13:57.172837	0.0000	f
242	1	23.03259900	72.55246500	\N	2026-08-03 17:14:17.170742	0.0000	f
243	1	23.03259900	72.55246500	\N	2026-08-03 17:14:43.427798	0.0000	f
244	1	23.03259900	72.55246500	\N	2026-08-03 17:15:43.455346	0.0000	f
1255	1	23.02825769	72.62092780	\N	2026-08-26 15:28:45.28872	0.0000	f
1256	1	23.02825769	72.62092780	\N	2026-08-26 15:29:45.213332	0.0000	f
1287	1	23.03276000	72.54978760	\N	2026-08-29 14:33:38.247243	0.0000	f
1307	1	23.03276230	72.54978630	\N	2026-08-29 15:23:02.74157	0.0000	f
1327	1	23.02987100	72.54632800	\N	2026-08-29 16:39:39.724993	0.4067	t
250	1	23.03259900	72.55246500	\N	2026-08-03 17:19:57.788909	0.0000	f
1369	1	23.03244200	72.54913530	\N	2026-09-06 14:45:24.744588	0.0000	f
1396	1	23.03352180	72.54913530	\N	2026-09-06 17:24:34.105814	0.0000	f
1257	1	23.02825769	72.62092780	\N	2026-08-26 15:30:45.375419	0.0000	f
1262	1	23.03276000	72.54978760	\N	2026-08-29 14:25:48.800507	7.2592	t
1288	1	23.03276000	72.54978760	\N	2026-08-29 14:34:08.244502	0.0000	f
1309	1	23.03276230	72.54978630	\N	2026-08-29 15:28:47.848743	0.0000	f
1328	1	23.02987100	72.54632800	\N	2026-08-29 16:41:04.109258	0.0000	f
1341	1	23.03273370	72.54970160	\N	2026-08-30 12:55:25.185682	0.0958	t
1343	1	23.03277070	72.54979490	\N	2026-08-30 12:55:27.606356	0.0104	f
1350	1	23.03244200	72.54913530	\N	2026-09-06 13:22:10.397809	0.0000	f
1370	1	23.03244200	72.54913530	\N	2026-09-06 14:45:41.725202	0.0000	f
1397	1	23.03352180	72.54913530	\N	2026-09-06 17:29:08.227289	0.0000	f
364	1	23.02835710	72.62454140	\N	2026-08-07 23:25:12.934909	7.3908	t
365	1	23.02893400	72.62086570	\N	2026-08-07 23:26:19.441268	0.3816	t
366	1	23.02893400	72.62086570	\N	2026-08-07 23:26:19.58077	0.0000	f
367	1	23.02898780	72.62089180	\N	2026-08-07 23:26:40.152833	0.0066	f
368	1	23.02898830	72.62089220	\N	2026-08-07 23:27:00.180975	0.0001	f
369	1	23.02898780	72.62089180	\N	2026-08-07 23:27:20.175742	0.0001	f
370	1	23.02898780	72.62089180	\N	2026-08-07 23:27:47.463195	0.0000	f
371	1	23.02898780	72.62089180	\N	2026-08-07 23:28:17.50867	0.0000	f
372	1	23.02898780	72.62089180	\N	2026-08-07 23:28:17.691584	0.0000	f
373	1	23.02898780	72.62089180	\N	2026-08-07 23:28:47.529055	0.0000	f
374	1	23.02898780	72.62089180	\N	2026-08-07 23:29:17.638656	0.0000	f
375	1	23.02898780	72.62089180	\N	2026-08-07 23:29:17.688056	0.0000	f
376	1	23.02898780	72.62089180	\N	2026-08-07 23:29:47.661663	0.0000	f
377	1	23.02898780	72.62089180	\N	2026-08-07 23:30:17.710811	0.0000	f
378	1	23.02898780	72.62089180	\N	2026-08-07 23:30:17.787344	0.0000	f
379	1	23.02898780	72.62089180	\N	2026-08-07 23:30:47.882863	0.0000	f
380	1	23.02898780	72.62089180	\N	2026-08-07 23:31:17.836733	0.0000	f
381	1	23.02898780	72.62089180	\N	2026-08-07 23:31:17.955767	0.0000	f
382	1	23.02898780	72.62089180	\N	2026-08-07 23:31:47.881501	0.0000	f
383	1	23.02898780	72.62089180	\N	2026-08-07 23:32:17.957297	0.0000	f
384	1	23.02898780	72.62089180	\N	2026-08-07 23:32:18.036911	0.0000	f
385	1	23.02898780	72.62089180	\N	2026-08-07 23:32:48.462021	0.0000	f
386	1	23.02898780	72.62089180	\N	2026-08-07 23:33:18.155764	0.0000	f
387	1	23.02898780	72.62089180	\N	2026-08-07 23:33:18.20815	0.0000	f
388	1	23.02898780	72.62089180	\N	2026-08-07 23:33:48.281772	0.0000	f
389	1	23.02898780	72.62089180	\N	2026-08-07 23:34:18.294323	0.0000	f
390	1	23.02898780	72.62089180	\N	2026-08-07 23:34:18.359806	0.0000	f
391	1	23.02898780	72.62089180	\N	2026-08-07 23:34:48.28775	0.0000	f
392	1	23.02898780	72.62089180	\N	2026-08-07 23:35:18.312055	0.0000	f
393	1	23.02898780	72.62089180	\N	2026-08-07 23:35:18.367312	0.0000	f
394	1	23.02898780	72.62089180	\N	2026-08-07 23:35:48.336664	0.0000	f
395	1	23.02898780	72.62089180	\N	2026-08-07 23:36:18.332802	0.0000	f
396	1	23.02898780	72.62089180	\N	2026-08-07 23:36:18.373004	0.0000	f
397	1	23.02898780	72.62089180	\N	2026-08-07 23:36:48.415839	0.0000	f
398	1	23.02898780	72.62089180	\N	2026-08-07 23:37:18.50631	0.0000	f
399	1	23.02898780	72.62089180	\N	2026-08-07 23:37:18.731518	0.0000	f
400	1	23.02898780	72.62089180	\N	2026-08-07 23:37:48.533189	0.0000	f
401	1	23.02898780	72.62089180	\N	2026-08-07 23:38:18.534089	0.0000	f
402	1	23.02898780	72.62089180	\N	2026-08-07 23:38:18.821656	0.0000	f
403	1	23.02898780	72.62089180	\N	2026-08-07 23:38:48.723317	0.0000	f
404	1	23.02898780	72.62089180	\N	2026-08-07 23:39:18.749857	0.0000	f
405	1	23.02898780	72.62089180	\N	2026-08-07 23:39:18.971752	0.0000	f
406	1	23.02898780	72.62089180	\N	2026-08-07 23:39:48.702914	0.0000	f
407	1	23.02898780	72.62089180	\N	2026-08-07 23:40:18.80133	0.0000	f
408	1	23.02898780	72.62089180	\N	2026-08-07 23:40:18.908841	0.0000	f
409	1	23.02898780	72.62089180	\N	2026-08-07 23:40:48.866883	0.0000	f
410	1	23.02898780	72.62089180	\N	2026-08-07 23:41:18.901466	0.0000	f
411	1	23.02898780	72.62089180	\N	2026-08-07 23:41:19.008544	0.0000	f
412	1	23.02898780	72.62089180	\N	2026-08-07 23:41:48.920895	0.0000	f
413	1	23.02898780	72.62089180	\N	2026-08-07 23:42:19.349424	0.0000	f
414	1	23.02898780	72.62089180	\N	2026-08-07 23:42:19.357173	0.0000	f
415	1	23.02898780	72.62089180	\N	2026-08-07 23:42:48.980853	0.0000	f
416	1	23.02898780	72.62089180	\N	2026-08-07 23:43:19.0364	0.0000	f
417	1	23.02898780	72.62089180	\N	2026-08-07 23:43:19.150048	0.0000	f
418	1	23.02898780	72.62089180	\N	2026-08-07 23:43:49.236308	0.0000	f
419	1	23.02898780	72.62089180	\N	2026-08-07 23:44:19.086184	0.0000	f
420	1	23.02898780	72.62089180	\N	2026-08-07 23:44:19.139619	0.0000	f
421	1	23.02898780	72.62089180	\N	2026-08-07 23:44:49.09396	0.0000	f
422	1	23.02898780	72.62089180	\N	2026-08-07 23:45:19.198141	0.0000	f
423	1	23.02898780	72.62089180	\N	2026-08-07 23:45:19.22896	0.0000	f
424	1	23.02898780	72.62089180	\N	2026-08-07 23:45:49.232217	0.0000	f
425	1	23.02898780	72.62089180	\N	2026-08-07 23:46:19.436856	0.0000	f
426	1	23.02898780	72.62089180	\N	2026-08-07 23:46:19.439667	0.0000	f
427	1	23.02898780	72.62089180	\N	2026-08-07 23:46:49.368634	0.0000	f
428	1	23.02898780	72.62089180	\N	2026-08-07 23:47:19.456899	0.0000	f
429	1	23.02898780	72.62089180	\N	2026-08-07 23:47:19.506963	0.0000	f
430	1	23.02898780	72.62089180	\N	2026-08-07 23:47:49.530432	0.0000	f
431	1	23.02898780	72.62089180	\N	2026-08-07 23:48:19.56888	0.0000	f
432	1	23.02898780	72.62089180	\N	2026-08-07 23:48:19.684794	0.0000	f
435	1	23.02898780	72.62089180	\N	2026-08-07 23:49:19.720621	0.0000	f
436	1	23.02898780	72.62089180	\N	2026-08-07 23:49:49.70559	0.0000	f
440	1	23.02898780	72.62089180	\N	2026-08-07 23:51:19.922213	0.0000	f
441	1	23.02898780	72.62089180	\N	2026-08-07 23:51:20.039638	0.0000	f
442	1	23.02898780	72.62089180	\N	2026-08-07 23:51:50.265242	0.0000	f
448	1	23.02898780	72.62089180	\N	2026-08-07 23:53:50.277126	0.0000	f
1224	1	23.03600000	72.56430000	\N	2026-08-20 14:29:56.256864	0.0000	f
1228	1	23.03600000	72.56430000	\N	2026-08-20 14:34:28.087995	0.0000	f
1258	1	23.02825769	72.62092780	\N	2026-08-26 15:31:45.268283	0.0000	f
1263	1	23.03276000	72.54978760	\N	2026-08-29 14:25:48.834752	0.0000	f
1290	1	23.03276000	72.54978760	\N	2026-08-29 14:34:38.258495	0.0000	f
1310	1	23.03276230	72.54978630	\N	2026-08-29 15:35:08.988788	0.0000	f
1329	1	23.03276010	72.54876560	\N	2026-08-29 16:42:27.108628	0.4067	t
1342	1	23.03273370	72.54970160	\N	2026-08-30 12:55:25.589394	0.0000	f
1351	1	23.03244200	72.54913530	\N	2026-09-06 13:22:10.743346	0.0000	f
1352	1	23.03244200	72.54913530	\N	2026-09-06 13:22:24.688185	0.0000	f
1371	1	23.03352180	72.54913530	\N	2026-09-06 15:18:28.727384	0.0000	f
1398	1	23.03352180	72.54913530	\N	2026-09-06 17:29:08.845487	0.0000	f
433	1	23.02898780	72.62089180	\N	2026-08-07 23:48:49.574611	0.0000	f
434	1	23.02898780	72.62089180	\N	2026-08-07 23:49:19.669611	0.0000	f
437	1	23.02898780	72.62089180	\N	2026-08-07 23:50:19.818544	0.0000	f
438	1	23.02898780	72.62089180	\N	2026-08-07 23:50:20.245909	0.0000	f
439	1	23.02898780	72.62089180	\N	2026-08-07 23:50:49.802188	0.0000	f
443	1	23.02898780	72.62089180	\N	2026-08-07 23:52:20.041681	0.0000	f
444	1	23.02898780	72.62089180	\N	2026-08-07 23:52:20.134193	0.0000	f
445	1	23.02898780	72.62089180	\N	2026-08-07 23:52:50.067944	0.0000	f
446	1	23.02898780	72.62089180	\N	2026-08-07 23:53:20.230598	0.0000	f
447	1	23.02898780	72.62089180	\N	2026-08-07 23:53:20.343584	0.0000	f
449	1	23.02898780	72.62089180	\N	2026-08-07 23:54:20.325759	0.0000	f
450	1	23.02898780	72.62089180	\N	2026-08-07 23:54:20.3415	0.0000	f
451	1	23.02898780	72.62089180	\N	2026-08-07 23:54:50.317684	0.0000	f
452	1	23.02898780	72.62089180	\N	2026-08-07 23:55:20.616384	0.0000	f
453	1	23.02898780	72.62089180	\N	2026-08-07 23:55:20.679193	0.0000	f
454	1	23.02899110	72.62089910	\N	2026-08-07 23:59:09.455356	0.0008	f
455	1	23.02899110	72.62089910	\N	2026-08-07 23:59:09.556112	0.0000	f
456	1	23.02899110	72.62089910	\N	2026-08-07 23:59:39.472325	0.0000	f
457	1	23.02899110	72.62089910	\N	2026-08-07 23:59:39.595062	0.0000	f
458	1	23.02899110	72.62089910	\N	2026-08-08 00:00:09.791388	0.0000	f
459	1	23.02899110	72.62089910	\N	2026-08-08 00:00:14.552606	0.0000	f
460	1	23.02899110	72.62089910	\N	2026-08-08 00:00:39.637039	0.0000	f
461	1	23.02899110	72.62089910	\N	2026-08-08 00:01:09.637947	0.0000	f
462	1	23.02899110	72.62089910	\N	2026-08-08 00:01:14.568908	0.0000	f
463	1	23.02899110	72.62089910	\N	2026-08-08 00:03:01.141363	0.0000	f
464	1	23.02899110	72.62089910	\N	2026-08-08 00:03:01.223667	0.0000	f
465	1	23.02899110	72.62089910	\N	2026-08-08 00:03:29.988943	0.0000	f
466	1	23.02899110	72.62089910	\N	2026-08-08 00:04:00.10792	0.0000	f
467	1	23.02899110	72.62089910	\N	2026-08-08 00:04:00.135424	0.0000	f
468	1	23.02899110	72.62089910	\N	2026-08-08 00:04:30.350694	0.0000	f
469	1	23.02899110	72.62089910	\N	2026-08-08 00:05:00.244109	0.0000	f
470	1	23.02899110	72.62089910	\N	2026-08-08 00:05:00.368746	0.0000	f
471	1	23.02899110	72.62089910	\N	2026-08-08 00:05:30.283801	0.0000	f
472	1	23.02899110	72.62089910	\N	2026-08-08 00:06:00.424393	0.0000	f
473	1	23.02899110	72.62089910	\N	2026-08-08 00:06:00.468394	0.0000	f
474	1	23.02899110	72.62089910	\N	2026-08-08 00:06:30.453155	0.0000	f
475	1	23.02899110	72.62089910	\N	2026-08-08 00:07:00.650248	0.0000	f
476	1	23.02899110	72.62089910	\N	2026-08-08 00:07:00.698652	0.0000	f
477	1	23.02899110	72.62089910	\N	2026-08-08 00:07:30.644002	0.0000	f
478	1	23.02899110	72.62089910	\N	2026-08-08 00:08:00.772221	0.0000	f
479	1	23.02899110	72.62089910	\N	2026-08-08 00:08:00.786521	0.0000	f
480	1	23.02899110	72.62089910	\N	2026-08-08 00:08:30.751272	0.0000	f
481	1	23.02899110	72.62089910	\N	2026-08-08 00:09:00.81998	0.0000	f
482	1	23.02899110	72.62089910	\N	2026-08-08 00:09:01.003669	0.0000	f
483	1	23.02899110	72.62089910	\N	2026-08-08 00:09:30.817625	0.0000	f
484	1	23.02899110	72.62089910	\N	2026-08-08 00:10:00.877736	0.0000	f
485	1	23.02899110	72.62089910	\N	2026-08-08 00:10:00.940443	0.0000	f
486	1	23.02899110	72.62089910	\N	2026-08-08 00:10:30.880946	0.0000	f
487	1	23.02899110	72.62089910	\N	2026-08-08 00:11:00.98123	0.0000	f
488	1	23.02899110	72.62089910	\N	2026-08-08 00:11:01.070875	0.0000	f
489	1	23.02899110	72.62089910	\N	2026-08-08 00:11:31.124638	0.0000	f
490	1	23.02899110	72.62089910	\N	2026-08-08 00:12:01.04571	0.0000	f
491	1	23.02899110	72.62089910	\N	2026-08-08 00:12:01.195613	0.0000	f
492	1	23.02899110	72.62089910	\N	2026-08-08 00:12:31.148281	0.0000	f
493	1	23.02899110	72.62089910	\N	2026-08-08 00:13:01.246561	0.0000	f
494	1	23.02899110	72.62089910	\N	2026-08-08 00:13:01.25112	0.0000	f
495	1	23.02899110	72.62089910	\N	2026-08-08 00:13:31.097999	0.0000	f
496	1	23.02899110	72.62089910	\N	2026-08-08 00:14:01.291858	0.0000	f
497	1	23.02899110	72.62089910	\N	2026-08-08 00:14:01.32334	0.0000	f
498	1	23.02899110	72.62089910	\N	2026-08-08 00:14:31.30123	0.0000	f
499	1	23.02899110	72.62089910	\N	2026-08-08 00:15:01.373625	0.0000	f
500	1	23.02899110	72.62089910	\N	2026-08-08 00:15:01.439353	0.0000	f
501	1	23.02899110	72.62089910	\N	2026-08-08 00:15:31.515572	0.0000	f
502	1	23.02899110	72.62089910	\N	2026-08-08 00:16:01.343128	0.0000	f
503	1	23.02899110	72.62089910	\N	2026-08-08 00:16:01.422378	0.0000	f
504	1	23.02899110	72.62089910	\N	2026-08-08 00:16:31.499259	0.0000	f
505	1	23.02899110	72.62089910	\N	2026-08-08 00:17:01.495127	0.0000	f
506	1	23.02899110	72.62089910	\N	2026-08-08 00:17:01.603851	0.0000	f
507	1	23.02899110	72.62089910	\N	2026-08-08 00:17:31.531104	0.0000	f
508	1	23.02899110	72.62089910	\N	2026-08-08 00:18:01.474626	0.0000	f
509	1	23.02899110	72.62089910	\N	2026-08-08 00:18:01.557781	0.0000	f
510	1	23.02899110	72.62089910	\N	2026-08-08 00:18:31.526056	0.0000	f
511	1	23.02899110	72.62089910	\N	2026-08-08 00:19:01.700937	0.0000	f
512	1	23.02899110	72.62089910	\N	2026-08-08 00:19:01.771686	0.0000	f
513	1	23.02899110	72.62089910	\N	2026-08-08 00:19:31.639413	0.0000	f
514	1	23.02899110	72.62089910	\N	2026-08-08 00:20:01.795402	0.0000	f
515	1	23.02899110	72.62089910	\N	2026-08-08 00:20:01.901653	0.0000	f
516	1	23.02899110	72.62089910	\N	2026-08-08 00:20:31.759037	0.0000	f
517	1	23.02899110	72.62089910	\N	2026-08-08 00:21:01.81413	0.0000	f
518	1	23.02899110	72.62089910	\N	2026-08-08 00:21:01.885081	0.0000	f
519	1	23.02899110	72.62089910	\N	2026-08-08 00:21:31.812474	0.0000	f
520	1	23.02899110	72.62089910	\N	2026-08-08 00:22:01.90818	0.0000	f
521	1	23.02899110	72.62089910	\N	2026-08-08 00:22:01.958575	0.0000	f
522	1	23.02899110	72.62089910	\N	2026-08-08 00:22:32.052691	0.0000	f
523	1	23.02899110	72.62089910	\N	2026-08-08 00:23:01.943922	0.0000	f
524	1	23.02899110	72.62089910	\N	2026-08-08 00:23:02.011815	0.0000	f
525	1	23.02899110	72.62089910	\N	2026-08-08 00:23:31.902698	0.0000	f
526	1	23.02899110	72.62089910	\N	2026-08-08 00:24:02.044705	0.0000	f
527	1	23.02899110	72.62089910	\N	2026-08-08 00:24:02.084613	0.0000	f
528	1	23.02899110	72.62089910	\N	2026-08-08 00:24:32.051214	0.0000	f
529	1	23.02899110	72.62089910	\N	2026-08-08 00:25:02.216592	0.0000	f
530	1	23.02899110	72.62089910	\N	2026-08-08 00:25:02.237103	0.0000	f
531	1	23.02899110	72.62089910	\N	2026-08-08 00:25:32.1714	0.0000	f
532	1	23.02899110	72.62089910	\N	2026-08-08 00:26:02.39273	0.0000	f
533	1	23.02899110	72.62089910	\N	2026-08-08 00:26:02.438476	0.0000	f
534	1	23.02899110	72.62089910	\N	2026-08-08 00:31:50.018646	0.0000	f
535	1	23.02899110	72.62089910	\N	2026-08-08 00:31:50.136442	0.0000	f
536	1	23.02899110	72.62089910	\N	2026-08-08 00:31:50.156723	0.0000	f
537	1	23.02899110	72.62089910	\N	2026-08-08 00:31:50.157992	0.0000	f
538	1	23.02899110	72.62089910	\N	2026-08-08 00:31:50.214335	0.0000	f
539	1	23.02899110	72.62089910	\N	2026-08-08 00:31:50.280191	0.0000	f
540	1	23.02899110	72.62089910	\N	2026-08-08 00:32:49.672246	0.0000	f
541	1	23.02899110	72.62089910	\N	2026-08-08 00:33:55.72428	0.0000	f
542	1	23.02899110	72.62089910	\N	2026-08-08 00:33:55.806348	0.0000	f
543	1	23.02899110	72.62089910	\N	2026-08-08 00:34:00.859908	0.0000	f
544	1	23.02899110	72.62089910	\N	2026-08-08 00:34:00.962735	0.0000	f
545	1	23.02899110	72.62089910	\N	2026-08-08 00:34:55.281896	0.0000	f
546	1	23.02899110	72.62089910	\N	2026-08-08 00:35:55.316583	0.0000	f
547	1	23.02899110	72.62089910	\N	2026-08-08 00:36:55.35641	0.0000	f
548	1	23.02899110	72.62089910	\N	2026-08-08 00:37:55.363958	0.0000	f
549	1	23.02899110	72.62089910	\N	2026-08-08 00:38:55.399241	0.0000	f
1259	1	23.02825769	72.62092780	\N	2026-08-26 15:45:52.001972	0.0000	f
1264	1	23.03276000	72.54978760	\N	2026-08-29 14:25:50.382352	0.0000	f
552	1	23.02899110	72.62089910	\N	2026-08-08 00:39:55.459185	0.0000	f
553	1	23.02899110	72.62089910	\N	2026-08-08 00:40:55.404397	0.0000	f
554	1	23.02899110	72.62089910	\N	2026-08-08 00:41:55.508478	0.0000	f
555	1	23.02899110	72.62089910	\N	2026-08-08 00:42:55.547769	0.0000	f
556	1	23.02899110	72.62089910	\N	2026-08-08 00:43:55.484581	0.0000	f
557	1	23.02899110	72.62089910	\N	2026-08-08 00:44:55.489474	0.0000	f
558	1	23.02899110	72.62089910	\N	2026-08-08 00:45:55.503974	0.0000	f
559	1	23.02899110	72.62089910	\N	2026-08-08 00:46:55.493403	0.0000	f
560	1	23.02899110	72.62089910	\N	2026-08-08 00:47:55.544132	0.0000	f
561	1	23.02899110	72.62089910	\N	2026-08-08 00:48:55.59047	0.0000	f
562	1	23.02899110	72.62089910	\N	2026-08-08 00:49:55.650446	0.0000	f
563	1	23.02899110	72.62089910	\N	2026-08-08 00:50:55.585231	0.0000	f
564	1	23.02899110	72.62089910	\N	2026-08-08 00:51:55.600192	0.0000	f
565	1	23.02899110	72.62089910	\N	2026-08-08 00:52:55.610454	0.0000	f
566	1	23.02899110	72.62089910	\N	2026-08-08 00:53:55.642549	0.0000	f
567	1	23.02898900	72.62089240	\N	2026-08-08 00:55:06.797441	0.0007	f
568	1	23.02898900	72.62089240	\N	2026-08-08 00:55:06.965808	0.0000	f
569	1	23.02898900	72.62089240	\N	2026-08-08 00:55:06.979501	0.0000	f
570	1	23.02898900	72.62089240	\N	2026-08-08 00:55:06.990389	0.0000	f
571	1	23.02898900	72.62089240	\N	2026-08-08 00:55:07.013507	0.0000	f
572	1	23.02898900	72.62089240	\N	2026-08-08 00:55:07.102356	0.0000	f
573	1	23.02898900	72.62089240	\N	2026-08-08 00:56:06.580877	0.0000	f
574	1	23.02898900	72.62089240	\N	2026-08-08 00:57:06.403765	0.0000	f
575	1	23.02898900	72.62089240	\N	2026-08-08 00:58:06.445537	0.0000	f
576	1	23.02898900	72.62089240	\N	2026-08-08 01:00:02.885819	0.0000	f
577	1	23.02898900	72.62089240	\N	2026-08-08 01:00:02.972421	0.0000	f
578	1	23.02898900	72.62089240	\N	2026-08-08 01:00:03.022197	0.0000	f
579	1	23.02898900	72.62089240	\N	2026-08-08 01:00:03.119068	0.0000	f
580	1	23.02898900	72.62089240	\N	2026-08-08 01:00:03.128988	0.0000	f
581	1	23.02898900	72.62089240	\N	2026-08-08 01:00:03.269089	0.0000	f
582	1	23.02898900	72.62089240	\N	2026-08-08 01:01:02.369265	0.0000	f
583	1	23.02898900	72.62089240	\N	2026-08-08 01:02:02.715961	0.0000	f
584	1	23.02898900	72.62089240	\N	2026-08-08 01:03:02.372547	0.0000	f
1265	1	23.03276000	72.54978760	\N	2026-08-29 14:26:18.811599	0.0000	f
1291	1	23.03276000	72.54978760	\N	2026-08-29 14:35:08.311106	0.0000	f
1292	1	23.03276000	72.54978760	\N	2026-08-29 14:35:08.42866	0.0000	f
1311	1	23.03276230	72.54978630	\N	2026-08-29 15:35:09.208726	0.0000	f
1312	1	23.03276230	72.54978630	\N	2026-08-29 15:35:30.319686	0.0000	f
1330	1	23.03276010	72.54876560	\N	2026-08-29 16:42:27.248183	0.0000	f
1331	1	23.03276010	72.54876560	\N	2026-08-29 16:42:27.343539	0.0000	f
1344	1	23.03276010	72.54876560	\N	2026-08-30 16:26:08.11383	0.0000	f
1353	1	23.03244200	72.54913530	\N	2026-09-06 13:30:35.204431	0.0000	f
1354	1	23.03244200	72.54913530	\N	2026-09-06 13:30:35.548738	0.0000	f
1372	1	23.03352180	72.54913530	\N	2026-09-06 15:51:33.411599	0.0000	f
1373	1	23.03352180	72.54913530	\N	2026-09-06 15:51:33.9401	0.0000	f
1375	1	23.03352180	72.54913530	\N	2026-09-06 15:52:58.890767	0.0000	f
1376	1	23.03352180	72.54913530	\N	2026-09-06 15:52:59.95498	0.0000	f
1380	1	23.03352180	72.54913530	\N	2026-09-06 15:57:35.133232	0.0000	f
1381	1	23.03244200	72.54913530	\N	2026-09-06 15:59:27.012818	0.0000	f
1383	1	23.03244200	72.54913530	\N	2026-09-06 16:05:26.023147	0.0000	f
1384	1	23.03244200	72.54913530	\N	2026-09-06 16:05:26.056793	0.0000	f
1399	1	23.03352180	72.54913530	\N	2026-09-06 17:29:08.893559	0.0000	f
1260	1	23.02820486	72.62055172	\N	2026-08-26 18:00:46.679227	0.0389	f
1261	1	23.02820486	72.62055172	\N	2026-08-26 18:00:46.760758	0.0000	f
1266	1	23.03276000	72.54978760	\N	2026-08-29 14:26:48.916387	0.0000	f
1267	1	23.03276000	72.54978760	\N	2026-08-29 14:26:50.457917	0.0000	f
1268	1	23.03276000	72.54978760	\N	2026-08-29 14:27:18.836341	0.0000	f
1269	1	23.03276000	72.54978760	\N	2026-08-29 14:27:48.820137	0.0000	f
1270	1	23.03276000	72.54978760	\N	2026-08-29 14:27:50.451038	0.0000	f
1271	1	23.03276000	72.54978760	\N	2026-08-29 14:28:18.853613	0.0000	f
1293	1	23.03276000	72.54978760	\N	2026-08-29 14:35:38.25952	0.0000	f
1313	1	23.03276230	72.54978630	\N	2026-08-29 15:38:26.033924	0.0000	f
1332	1	23.03273810	72.54971160	\N	2026-08-29 16:51:43.668668	0.0968	t
1345	1	23.03276800	72.54978580	\N	2026-08-30 16:26:10.017771	0.0000	f
1355	1	23.03244200	72.54913530	\N	2026-09-06 13:30:54.850038	0.0000	f
1374	1	23.03352180	72.54913530	\N	2026-09-06 15:51:33.962039	0.0000	f
1377	1	23.03352180	72.54913530	\N	2026-09-06 15:53:00.070169	0.0000	f
1378	1	23.03352180	72.54913530	\N	2026-09-06 15:57:34.005548	0.0000	f
1379	1	23.03352180	72.54913530	\N	2026-09-06 15:57:35.043411	0.0000	f
1400	1	23.03352180	72.54913530	\N	2026-09-06 17:47:00.361432	0.0000	f
1402	1	23.03352180	72.54913530	\N	2026-09-06 17:47:01.137597	0.0000	f
1272	1	23.03276000	72.54978760	\N	2026-08-29 14:28:48.942894	0.0000	f
1294	1	23.03276000	72.54978760	\N	2026-08-29 14:36:45.816177	0.0000	f
1314	1	23.03276230	72.54978630	\N	2026-08-29 15:38:26.424689	0.0000	f
1333	1	23.03273810	72.54971160	\N	2026-08-29 16:51:44.019764	0.0000	f
1346	1	23.03276800	72.54978580	\N	2026-08-30 16:26:10.03141	0.0000	f
1356	1	23.03244200	72.54913530	\N	2026-09-06 13:43:09.330667	0.0000	f
766	1	23.02812400	72.62083400	\N	2026-08-09 18:31:14.386537	0.0964	t
767	1	23.02812400	72.62083400	\N	2026-08-09 18:31:14.391731	0.0000	f
768	1	23.02826791	72.62147297	\N	2026-08-09 18:31:46.797062	0.0673	f
769	1	23.02826791	72.62147297	\N	2026-08-09 18:31:46.825234	0.0000	f
770	1	23.02826791	72.62147297	\N	2026-08-09 18:32:11.324525	0.0000	f
771	1	23.02829902	72.62112086	\N	2026-08-09 18:32:19.072833	0.0000	f
772	1	23.02829902	72.62112086	\N	2026-08-09 18:32:19.175371	0.0362	f
773	1	23.02816974	72.62086918	\N	2026-08-09 18:32:51.546044	0.0295	t
774	1	23.02816974	72.62086918	\N	2026-08-09 18:32:51.563128	0.0000	f
775	1	23.02816974	72.62086918	\N	2026-08-09 18:32:59.655157	0.0000	f
776	1	23.02816974	72.62086918	\N	2026-08-09 18:32:59.655785	0.0000	f
777	1	23.02820518	72.62089781	\N	2026-08-09 18:33:23.716238	0.0049	f
778	1	23.02820518	72.62089781	\N	2026-08-09 18:33:23.844008	0.0000	f
779	1	23.02820518	72.62089781	\N	2026-08-09 18:34:00.460713	0.0000	f
780	1	23.02824636	72.62150437	\N	2026-08-09 18:34:40.158439	0.0622	t
781	1	23.02824636	72.62150437	\N	2026-08-09 18:34:40.194585	0.0000	f
782	1	23.02824636	72.62150437	\N	2026-08-09 18:35:00.261438	0.0000	f
783	1	23.02824636	72.62150437	\N	2026-08-09 18:36:00.339188	0.0000	f
784	1	23.02824636	72.62150437	\N	2026-08-09 18:37:00.214904	0.0000	f
785	1	23.02824636	72.62150437	\N	2026-08-09 18:38:00.18945	0.0000	f
786	1	23.02824636	72.62150437	\N	2026-08-09 18:39:00.149485	0.0000	f
787	1	23.02824636	72.62150437	\N	2026-08-09 18:40:45.26473	0.0000	f
788	1	23.02824636	72.62150437	\N	2026-08-09 18:41:11.379734	0.0000	f
789	1	23.02822377	72.62099416	\N	2026-08-09 18:41:13.244487	0.0523	f
790	1	23.02822377	72.62099416	\N	2026-08-09 18:41:13.354652	0.0523	f
791	1	23.02822377	72.62099416	\N	2026-08-09 18:42:01.585486	0.0000	f
792	1	23.02822377	72.62099416	\N	2026-08-09 18:43:55.170933	0.0000	f
793	1	23.02822377	72.62099416	\N	2026-08-09 18:44:55.100838	0.0000	f
794	1	23.02822377	72.62099416	\N	2026-08-09 18:45:28.869969	0.0000	f
795	1	23.02822377	72.62099416	\N	2026-08-09 18:46:00.172943	0.0000	f
1359	1	23.03244200	72.54913530	\N	2026-09-06 13:46:33.888991	0.0000	f
1361	1	23.03244200	72.54913530	\N	2026-09-06 13:46:39.715875	0.0000	f
1382	1	23.03244200	72.54913530	\N	2026-09-06 16:05:25.733786	0.0000	f
1401	1	23.03352180	72.54913530	\N	2026-09-06 17:47:01.11591	0.0000	f
1273	1	23.03276000	72.54978760	\N	2026-08-29 14:28:50.416557	0.0000	f
1295	1	23.03276000	72.54978760	\N	2026-08-29 14:36:45.848252	0.0000	f
1296	1	23.03276000	72.54978760	\N	2026-08-29 14:37:15.731878	0.0000	f
1315	1	23.03276230	72.54978630	\N	2026-08-29 15:38:26.427625	0.0000	f
1334	1	23.03273810	72.54971160	\N	2026-08-29 16:51:48.895778	0.0000	f
1347	1	23.03248380	72.54950500	\N	2026-08-30 16:29:12.950469	0.0000	f
1349	1	23.03248380	72.54950500	\N	2026-08-30 16:29:22.277085	0.0000	f
1357	1	23.03244200	72.54913530	\N	2026-09-06 13:43:09.569232	0.0000	f
1385	1	23.03244200	72.54913530	\N	2026-09-06 16:11:29.489858	0.0000	f
1387	1	23.03244200	72.54913530	\N	2026-09-06 16:11:29.936598	0.0000	f
1403	1	23.03352180	72.54913530	\N	2026-09-06 17:48:49.991831	0.0000	f
1274	1	23.03276000	72.54978760	\N	2026-08-29 14:29:18.941242	0.0000	f
1225	1	23.03600000	72.56430000	\N	2026-08-20 14:30:55.896136	0.0000	f
1226	1	23.03600000	72.56430000	\N	2026-08-20 14:31:59.215461	0.0000	f
1231	1	23.03600000	72.56430000	\N	2026-08-20 14:34:31.36755	0.0000	f
1275	1	23.03276000	72.54978760	\N	2026-08-29 14:29:48.908829	0.0000	f
1276	1	23.03276000	72.54978760	\N	2026-08-29 14:29:50.494381	0.0000	f
1277	1	23.03276000	72.54978760	\N	2026-08-29 14:30:18.895251	0.0000	f
1279	1	23.03276000	72.54978760	\N	2026-08-29 14:30:57.902034	0.0000	f
1297	1	23.03276000	72.54978760	\N	2026-08-29 14:37:45.817951	0.0000	f
1298	1	23.03276000	72.54978760	\N	2026-08-29 14:37:45.829698	0.0000	f
1316	1	23.03276230	72.54978630	\N	2026-08-29 15:55:04.572024	0.0000	f
1317	1	23.03276230	72.54978630	\N	2026-08-29 15:55:58.566747	0.0000	f
1335	1	23.03276010	72.54876560	\N	2026-08-29 17:19:31.277901	0.0968	t
1348	1	23.03248380	72.54950500	\N	2026-08-30 16:29:13.313897	0.0000	f
1358	1	23.03244200	72.54913530	\N	2026-09-06 13:43:09.59567	0.0000	f
1386	1	23.03244200	72.54913530	\N	2026-09-06 16:11:29.915146	0.0000	f
1404	1	23.03352180	72.54913530	\N	2026-09-06 17:48:50.422075	0.0000	f
1405	1	23.03352180	72.54913530	\N	2026-09-06 17:48:50.452591	0.0000	f
1278	1	23.03276000	72.54978760	\N	2026-08-29 14:30:57.899825	0.0000	f
1299	1	23.03276000	72.54978760	\N	2026-08-29 14:38:15.775574	0.0000	f
1318	1	23.03276230	72.54978630	\N	2026-08-29 15:55:58.796395	0.0000	f
1319	1	23.03276230	72.54978630	\N	2026-08-29 15:55:58.803818	0.0000	f
1336	1	23.03276010	72.54876560	\N	2026-08-29 17:19:31.503386	0.0000	f
1360	1	23.03244200	72.54913530	\N	2026-09-06 13:46:34.634434	0.0000	f
1388	1	23.03352180	72.54913530	\N	2026-09-06 16:43:44.49295	0.0000	f
1390	1	23.03352180	72.54913530	\N	2026-09-06 16:43:44.572568	0.0000	f
1406	1	23.03244200	72.54913530	\N	2026-09-06 18:04:47.39557	0.0000	f
1280	1	23.03276000	72.54978760	\N	2026-08-29 14:30:57.937464	0.0000	f
1300	1	23.03276000	72.54978760	\N	2026-08-29 14:43:42.451315	0.0000	f
1301	1	23.03276000	72.54978760	\N	2026-08-29 14:43:42.571788	0.0000	f
1320	1	23.03276010	72.54876560	\N	2026-08-29 16:03:39.028907	0.1044	t
1337	1	23.03276010	72.54876560	\N	2026-08-29 17:19:31.769631	0.0000	f
1362	1	23.03244200	72.54913530	\N	2026-09-06 13:55:24.524494	0.0000	f
1363	1	23.03244200	72.54913530	\N	2026-09-06 13:55:24.861668	0.0000	f
1389	1	23.03352180	72.54913530	\N	2026-09-06 16:43:44.55522	0.0000	f
1407	1	23.03244200	72.54913530	\N	2026-09-06 18:04:47.565117	0.0000	f
1409	1	23.03244200	72.54913530	\N	2026-09-06 18:04:47.624416	0.0000	f
1095	1	23.03275090	72.54979890	\N	2026-08-20 12:17:57.414558	7.3029	t
1096	1	23.03275090	72.54979890	\N	2026-08-20 12:17:57.460457	0.0000	f
1097	1	23.03275090	72.54979890	\N	2026-08-20 12:17:58.967687	0.0000	f
1098	1	23.03275090	72.54979890	\N	2026-08-20 12:18:57.456604	0.0000	f
1099	1	23.03275090	72.54979890	\N	2026-08-20 12:18:57.494941	0.0000	f
1100	1	23.03275090	72.54979890	\N	2026-08-20 12:18:59.073976	0.0000	f
1101	1	23.03275090	72.54979890	\N	2026-08-20 12:19:27.396309	0.0000	f
1108	1	23.03275090	72.54979890	\N	2026-08-20 12:19:57.449127	0.0000	f
1109	1	23.03275090	72.54979890	\N	2026-08-20 12:19:59.171187	0.0000	f
1281	1	23.03276000	72.54978760	\N	2026-08-29 14:31:27.52421	0.0000	f
1302	1	23.03276230	72.54978630	\N	2026-08-29 14:43:46.569462	0.0003	f
1321	1	23.03276010	72.54876560	\N	2026-08-29 16:04:10.102155	0.0000	f
1338	1	23.03276010	72.54876560	\N	2026-08-29 17:27:48.206785	0.0000	f
1339	1	23.03276010	72.54876560	\N	2026-08-29 17:27:48.415264	0.0000	f
1340	1	23.03276010	72.54876560	\N	2026-08-29 17:28:13.205498	0.0000	f
1364	1	23.03244200	72.54913530	\N	2026-09-06 13:55:24.892035	0.0000	f
1391	1	23.03244200	72.54913530	\N	2026-09-06 17:03:44.823662	0.0000	f
1392	1	23.03244200	72.54913530	\N	2026-09-06 17:03:44.886614	0.0000	f
1408	1	23.03244200	72.54913530	\N	2026-09-06 18:04:47.607887	0.0000	f
1216	1	23.03600000	72.56430000	\N	2026-08-20 14:26:06.755146	1.5272	t
1217	1	23.03600000	72.56430000	\N	2026-08-20 14:26:10.264309	0.0000	f
1218	1	23.03600000	72.56430000	\N	2026-08-20 14:26:10.293527	0.0000	f
1219	1	23.03600000	72.56430000	\N	2026-08-20 14:26:55.927469	0.0000	f
1220	1	23.03600000	72.56430000	\N	2026-08-20 14:26:56.071212	0.0000	f
1221	1	23.03600000	72.56430000	\N	2026-08-20 14:26:56.110407	0.0000	f
1222	1	23.03600000	72.56430000	\N	2026-08-20 14:27:56.10903	0.0000	f
1227	1	23.03600000	72.56430000	\N	2026-08-20 14:32:56.656541	0.0000	f
\.


--
-- Data for Name: device_registration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_registration (id, device_id, activation_key, activation_date, registered_by, city, state, area, installation_status, created_at) FROM stdin;
\.


--
-- Data for Name: device_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_status_history (id, device_id, internet, gps, status, battery_level, recorded_at) FROM stdin;
1	1	Connected	Active	Online	90	2026-08-01 16:51:13.987889
2	1	Connected	Active	Online	89	2026-08-01 16:51:19.069536
3	1	Connected	Active	Online	90	2026-08-01 16:52:04.366241
4	1	Connected	Active	Online	89	2026-08-01 16:52:09.548088
5	1	Connected	Inactive	Online	25	2026-08-02 00:23:12.376416
6	1	Disconnected	Inactive	Online	0	2026-08-02 00:23:12.472648
7	1	Connected	Inactive	Online	25	2026-08-02 00:23:12.478773
8	1	Unknown	Unknown	Online	\N	2026-08-02 00:23:14.125186
9	1	Unknown	Unknown	Online	\N	2026-08-02 00:23:14.327428
10	1	Connected	Inactive	Online	25	2026-08-02 00:23:32.31776
11	1	Unknown	Unknown	Online	\N	2026-08-02 00:23:35.643433
12	1	Connected	Active	Online	25	2026-08-02 00:23:52.384925
13	1	Unknown	Unknown	Online	\N	2026-08-02 00:23:55.713336
14	1	Connected	Active	Online	25	2026-08-02 00:24:12.412044
15	1	Unknown	Unknown	Online	\N	2026-08-02 00:24:15.772081
16	1	Connected	Active	Online	25	2026-08-02 00:24:32.398444
17	1	Unknown	Unknown	Online	\N	2026-08-02 00:24:35.758449
18	1	Connected	Inactive	Online	25	2026-08-02 00:25:05.21957
19	1	Connected	Inactive	Online	25	2026-08-02 00:25:05.220136
20	1	Unknown	Unknown	Online	\N	2026-08-02 00:25:06.802833
21	1	Unknown	Unknown	Online	\N	2026-08-02 00:25:06.838356
22	1	Connected	Active	Online	25	2026-08-02 00:25:24.640251
23	1	Unknown	Unknown	Online	\N	2026-08-02 00:25:28.03455
24	1	Connected	Active	Online	25	2026-08-02 00:25:44.702361
25	1	Unknown	Unknown	Online	\N	2026-08-02 00:25:48.059684
26	1	Connected	Active	Online	25	2026-08-02 00:26:04.758155
27	1	Unknown	Unknown	Online	\N	2026-08-02 00:26:08.011506
28	1	Connected	Active	Online	25	2026-08-02 00:26:24.77206
29	1	Unknown	Unknown	Online	\N	2026-08-02 00:26:28.100233
30	1	Connected	Active	Online	25	2026-08-02 00:26:44.753392
31	1	Unknown	Unknown	Online	\N	2026-08-02 00:26:48.056971
32	1	Connected	Active	Online	25	2026-08-02 00:27:04.709177
33	1	Unknown	Unknown	Online	\N	2026-08-02 00:27:08.114883
34	1	Connected	Active	Online	25	2026-08-02 00:27:24.743432
35	1	Unknown	Unknown	Online	\N	2026-08-02 00:27:28.069892
36	1	Connected	Active	Online	25	2026-08-02 00:27:44.779886
37	1	Unknown	Unknown	Online	\N	2026-08-02 00:27:48.139568
38	1	Connected	Active	Online	25	2026-08-02 00:28:04.798794
39	1	Unknown	Unknown	Online	\N	2026-08-02 00:28:08.248641
40	1	Connected	Active	Online	24	2026-08-02 00:28:24.805065
41	1	Unknown	Unknown	Online	\N	2026-08-02 00:28:28.149465
42	1	Connected	Active	Online	24	2026-08-02 00:28:44.825965
43	1	Unknown	Unknown	Online	\N	2026-08-02 00:28:48.203634
44	1	Connected	Active	Online	24	2026-08-02 00:29:04.929536
45	1	Unknown	Unknown	Online	\N	2026-08-02 00:29:08.246788
46	1	Connected	Active	Online	24	2026-08-02 00:29:24.873707
47	1	Unknown	Unknown	Online	\N	2026-08-02 00:29:28.24113
48	1	Connected	Active	Online	24	2026-08-02 00:29:44.887616
49	1	Unknown	Unknown	Online	\N	2026-08-02 00:29:48.21907
50	1	Connected	Active	Online	24	2026-08-02 00:30:04.912197
51	1	Unknown	Unknown	Online	\N	2026-08-02 00:30:08.237917
52	1	Connected	Active	Online	24	2026-08-02 00:30:24.921947
53	1	Unknown	Unknown	Online	\N	2026-08-02 00:30:28.226187
54	1	Connected	Active	Online	24	2026-08-02 00:30:44.922969
55	1	Unknown	Unknown	Online	\N	2026-08-02 00:30:48.278448
56	1	Connected	Active	Online	24	2026-08-02 00:31:04.953422
57	1	Unknown	Unknown	Online	\N	2026-08-02 00:31:08.420385
58	1	Connected	Active	Online	24	2026-08-02 00:31:25.620823
59	1	Unknown	Unknown	Online	\N	2026-08-02 00:31:28.39249
60	1	Connected	Active	Online	24	2026-08-02 00:31:45.558702
61	1	Unknown	Unknown	Online	\N	2026-08-02 00:31:48.322123
62	1	Connected	Active	Online	24	2026-08-02 00:32:04.989986
63	1	Unknown	Unknown	Online	\N	2026-08-02 00:32:15.161328
64	1	Connected	Active	Online	24	2026-08-02 00:32:25.016798
65	1	Connected	Active	Online	24	2026-08-02 00:32:45.007982
66	1	Unknown	Unknown	Online	\N	2026-08-02 00:32:45.148678
67	1	Unknown	Unknown	Online	\N	2026-08-02 00:32:45.323592
68	1	Connected	Active	Online	24	2026-08-02 00:33:05.0395
69	1	Unknown	Unknown	Online	\N	2026-08-02 00:33:15.183018
70	1	Connected	Active	Online	24	2026-08-02 00:33:25.050533
71	1	Connected	Active	Online	24	2026-08-02 00:33:45.174171
72	1	Unknown	Unknown	Online	\N	2026-08-02 00:33:45.280657
73	1	Unknown	Unknown	Online	\N	2026-08-02 00:33:45.365698
74	1	Connected	Active	Online	24	2026-08-02 00:34:05.13674
75	1	Unknown	Unknown	Online	\N	2026-08-02 00:34:15.308333
76	1	Connected	Active	Online	24	2026-08-02 00:34:25.125181
77	1	Connected	Active	Online	24	2026-08-02 00:34:45.122964
78	1	Unknown	Unknown	Online	\N	2026-08-02 00:34:45.320152
79	1	Unknown	Unknown	Online	\N	2026-08-02 00:34:45.414646
80	1	Connected	Active	Online	24	2026-08-02 00:35:05.150855
81	1	Unknown	Unknown	Online	\N	2026-08-02 00:35:15.425177
82	1	Connected	Active	Online	24	2026-08-02 00:35:25.154689
83	1	Connected	Active	Online	24	2026-08-02 00:35:45.237794
84	1	Unknown	Unknown	Online	\N	2026-08-02 00:35:45.343546
85	1	Unknown	Unknown	Online	\N	2026-08-02 00:35:45.458128
86	1	Connected	Active	Online	24	2026-08-02 00:36:05.178267
87	1	Unknown	Unknown	Online	\N	2026-08-02 00:36:15.381692
88	1	Connected	Active	Online	24	2026-08-02 00:36:25.256829
89	1	Connected	Active	Online	23	2026-08-02 00:36:45.226728
90	1	Unknown	Unknown	Online	\N	2026-08-02 00:36:45.491082
91	1	Unknown	Unknown	Online	\N	2026-08-02 00:36:45.522853
92	1	Connected	Active	Online	23	2026-08-02 00:37:05.250187
93	1	Unknown	Unknown	Online	\N	2026-08-02 00:37:15.553217
94	1	Connected	Active	Online	23	2026-08-02 00:37:25.285343
95	1	Connected	Active	Online	23	2026-08-02 00:37:45.283624
96	1	Unknown	Unknown	Online	\N	2026-08-02 00:37:45.602411
97	1	Unknown	Unknown	Online	\N	2026-08-02 00:37:45.697452
98	1	Connected	Active	Online	23	2026-08-02 00:38:05.275981
99	1	Unknown	Unknown	Online	\N	2026-08-02 00:38:15.634582
100	1	Connected	Active	Online	23	2026-08-02 00:38:25.312695
101	1	Connected	Active	Online	23	2026-08-02 00:38:45.371113
102	1	Unknown	Unknown	Online	\N	2026-08-02 00:38:45.739839
103	1	Unknown	Unknown	Online	\N	2026-08-02 00:38:45.796441
104	1	Connected	Active	Online	23	2026-08-02 00:39:05.36038
105	1	Unknown	Unknown	Online	\N	2026-08-02 00:39:15.767449
3179	1	\N	\N	Online	\N	2026-08-26 15:26:45.316405
3182	1	\N	\N	Online	\N	2026-08-26 15:26:47.391533
3279	1	Connected	Active	Online	61	2026-08-29 14:33:28.21179
3280	1	\N	\N	Online	\N	2026-08-29 14:33:38.247155
110	1	Connected	Active	Online	23	2026-08-02 00:39:25.346885
3379	1	Connected	Unknown	Online	56	2026-08-29 15:04:41.829031
112	1	Connected	Active	Online	23	2026-08-02 00:39:45.394071
3380	1	Connected	Unknown	Online	56	2026-08-29 15:05:01.847739
113	1	Unknown	Unknown	Online	\N	2026-08-02 00:39:45.879185
3180	1	Connected	Unknown	Online	94	2026-08-26 15:26:45.387776
115	1	Unknown	Unknown	Online	\N	2026-08-02 00:39:45.953925
3181	1	\N	\N	Online	\N	2026-08-26 15:26:47.390913
117	1	Connected	Active	Online	23	2026-08-02 00:40:05.377752
3281	1	Connected	Active	Online	61	2026-08-29 14:33:48.201591
119	1	Unknown	Unknown	Online	\N	2026-08-02 00:40:15.870157
3282	1	Connected	Active	Online	61	2026-08-29 14:34:08.180162
3283	1	\N	\N	Online	\N	2026-08-29 14:34:08.244428
122	1	Connected	Active	Online	23	2026-08-02 00:40:25.396631
3285	1	Connected	Active	Online	61	2026-08-29 14:34:28.223097
124	1	Connected	Active	Online	23	2026-08-02 00:40:45.421691
125	1	Unknown	Unknown	Online	\N	2026-08-02 00:40:45.8626
126	1	Unknown	Unknown	Online	\N	2026-08-02 00:40:46.014921
3286	1	\N	\N	Online	\N	2026-08-29 14:34:38.258414
3384	1	Connected	Unknown	Online	56	2026-08-29 15:06:21.842282
129	1	Connected	Active	Online	23	2026-08-02 00:41:05.4455
3452	1	Connected	Unknown	Online	51	2026-08-29 15:32:42.077587
131	1	Unknown	Unknown	Online	\N	2026-08-02 00:41:15.893345
3518	1	\N	\N	Online	\N	2026-08-29 16:04:10.469129
3576	1	Connected	Unknown	Online	41	2026-08-29 16:22:48.567297
134	1	Connected	Active	Online	23	2026-08-02 00:41:25.456323
3636	1	Connected	Unknown	Online	37	2026-08-29 16:43:46.545896
136	1	Connected	Active	Online	23	2026-08-02 00:41:45.480094
137	1	Unknown	Unknown	Online	\N	2026-08-02 00:41:45.986312
3638	1	Connected	Unknown	Online	37	2026-08-29 16:44:26.537394
139	1	Unknown	Unknown	Online	\N	2026-08-02 00:41:46.107269
3737	1	Connected	Unknown	Online	30	2026-08-29 17:21:30.884024
141	1	Connected	Active	Online	23	2026-08-02 00:42:05.478248
3739	1	Connected	Unknown	Online	30	2026-08-29 17:22:10.795619
143	1	Unknown	Unknown	Online	\N	2026-08-02 00:42:16.069111
3748	1	Connected	Unknown	Online	29	2026-08-29 17:25:11.141359
3749	1	Connected	Unknown	Online	29	2026-08-29 17:25:31.141901
146	1	Connected	Active	Online	23	2026-08-02 00:42:25.512852
3751	1	Connected	Unknown	Online	29	2026-08-29 17:26:11.158022
148	1	Connected	Active	Online	23	2026-08-02 00:42:45.520307
149	1	Unknown	Unknown	Online	\N	2026-08-02 00:42:46.180065
3757	1	\N	\N	Online	\N	2026-08-29 17:27:48.206705
151	1	Unknown	Unknown	Online	\N	2026-08-02 00:42:46.288822
3837	1	Connected	Unknown	Online	9	2026-08-30 16:29:12.705791
153	1	Connected	Active	Online	23	2026-08-02 00:43:05.546946
3838	1	Unknown	Unknown	Online	\N	2026-08-30 16:29:12.950231
3844	1	Connected	Unknown	Online	6	2026-08-30 16:30:32.49441
3928	1	Connected	Unknown	Online	24	2026-08-30 16:58:13.530567
157	1	Unknown	Unknown	Online	\N	2026-08-02 00:43:16.564935
158	1	Connected	Active	Online	23	2026-08-02 00:43:25.55398
3930	1	Connected	Unknown	Online	24	2026-08-30 16:58:53.620061
160	1	Connected	Active	Online	23	2026-08-02 00:43:45.575363
3986	1	Connected	Unknown	Online	46	2026-09-06 13:28:30.201058
162	1	Unknown	Unknown	Online	\N	2026-08-02 00:43:46.329882
163	1	Unknown	Unknown	Online	\N	2026-08-02 00:43:46.4235
4055	1	Connected	Unknown	Online	42	2026-09-06 13:52:11.274748
165	1	Disconnected	Active	Online	0	2026-08-02 00:44:01.613142
4102	1	Connected	Unknown	Online	39	2026-09-06 14:07:01.780128
4137	1	Unknown	Unknown	Online	\N	2026-09-06 14:18:11.084155
4140	1	Connected	Unknown	Online	37	2026-09-06 14:18:47.521418
4225	1	Connected	Unknown	Online	31	2026-09-06 14:46:20.991552
4227	1	Connected	Unknown	Online	31	2026-09-06 14:47:01.053392
4283	1	Connected	Unknown	Online	26	2026-09-06 15:10:01.469484
4331	1	Connected	Unknown	Online	23	2026-09-06 15:26:41.301997
4483	1	Connected	Unknown	Online	14	2026-09-06 16:16:08.7838
4489	1	Connected	Unknown	Online	15	2026-09-06 16:18:08.796249
4492	1	Connected	Unknown	Online	16	2026-09-06 16:19:08.829854
4520	1	Connected	Unknown	Online	21	2026-09-06 16:28:29.197154
4529	1	Connected	Unknown	Online	23	2026-09-06 16:31:29.254398
4530	1	Connected	Unknown	Online	23	2026-09-06 16:31:49.265979
4532	1	Connected	Unknown	Online	23	2026-09-06 16:32:29.333188
4537	1	Connected	Unknown	Online	24	2026-09-06 16:34:09.333865
4543	1	Connected	Unknown	Online	25	2026-09-06 16:36:09.410021
4545	1	Connected	Unknown	Online	26	2026-09-06 16:36:49.480326
4550	1	Connected	Unknown	Online	27	2026-09-06 16:38:29.518265
4558	1	Connected	Unknown	Online	28	2026-09-06 16:41:10.015046
4559	1	Connected	Unknown	Online	28	2026-09-06 16:41:29.746897
4561	1	Connected	Unknown	Online	29	2026-09-06 16:42:10.394539
4565	1	Connected	Unknown	Online	29	2026-09-06 16:43:29.855145
4566	1	Unknown	Unknown	Online	\N	2026-09-06 16:43:44.492871
4572	1	Connected	Unknown	Online	30	2026-09-06 16:44:49.843115
4612	1	Connected	Unknown	Online	28	2026-09-06 16:58:10.310737
4620	1	Connected	Unknown	Online	27	2026-09-06 17:00:50.431605
4717	1	Connected	Unknown	Online	22	2026-09-06 17:30:07.018141
4720	1	Connected	Unknown	Online	23	2026-09-06 17:31:07.080976
4722	1	Connected	Unknown	Online	23	2026-09-06 17:31:47.182575
4725	1	Connected	Unknown	Online	23	2026-09-06 17:32:47.187157
4726	1	Connected	Unknown	Online	23	2026-09-06 17:33:07.187506
4770	1	Unknown	Unknown	Online	\N	2026-09-06 17:47:01.115815
4773	1	Connected	Unknown	Online	31	2026-09-06 17:47:39.32961
4775	1	Connected	Unknown	Online	31	2026-09-06 17:48:19.377315
4778	1	Unknown	Unknown	Online	\N	2026-09-06 17:48:49.991771
4780	1	Unknown	Unknown	Online	\N	2026-09-06 17:48:50.452429
4819	1	Connected	Unknown	Online	32	2026-09-06 18:03:30.759592
4821	1	Connected	Unknown	Online	33	2026-09-06 18:04:10.822183
4823	1	Unknown	Unknown	Online	\N	2026-09-06 18:04:47.395488
4825	1	Unknown	Unknown	Online	\N	2026-09-06 18:04:47.561282
3183	1	Connected	Active	Online	94	2026-08-26 15:27:05.221876
3184	1	Connected	Active	Online	94	2026-08-26 15:27:25.223279
3185	1	\N	\N	Online	\N	2026-08-26 15:27:45.22128
3287	1	Connected	Active	Online	61	2026-08-29 14:34:48.303084
3288	1	Connected	Active	Online	61	2026-08-29 14:35:08.191985
3289	1	\N	\N	Online	\N	2026-08-29 14:35:08.267581
3291	1	Connected	Active	Online	60	2026-08-29 14:35:28.214998
3292	1	\N	\N	Online	\N	2026-08-29 14:35:38.259451
3388	1	Connected	Unknown	Online	55	2026-08-29 15:07:41.869632
3389	1	Connected	Unknown	Online	55	2026-08-29 15:08:01.864151
3390	1	Connected	Unknown	Online	55	2026-08-29 15:08:21.914327
3453	1	Connected	Unknown	Online	51	2026-08-29 15:34:02.102869
3520	1	\N	\N	Online	\N	2026-08-29 16:04:14.21338
3522	1	\N	\N	Online	\N	2026-08-29 16:04:14.34097
3524	1	Connected	Unknown	Online	45	2026-08-29 16:04:54.106177
3525	1	Connected	Unknown	Online	45	2026-08-29 16:05:14.100259
3527	1	Connected	Unknown	Online	45	2026-08-29 16:05:54.148458
3528	1	Connected	Unknown	Online	45	2026-08-29 16:06:14.111218
3529	1	Connected	Unknown	Online	45	2026-08-29 16:06:34.103526
3530	1	Connected	Unknown	Online	44	2026-08-29 16:06:54.123161
3532	1	Connected	Unknown	Online	44	2026-08-29 16:07:34.131986
3533	1	Connected	Unknown	Online	44	2026-08-29 16:07:54.131079
3534	1	Connected	Unknown	Online	44	2026-08-29 16:08:14.134069
3536	1	Connected	Unknown	Online	44	2026-08-29 16:08:59.01846
3537	1	Connected	Unknown	Online	44	2026-08-29 16:09:19.349049
3538	1	Connected	Unknown	Online	44	2026-08-29 16:09:38.999488
3539	1	Connected	Unknown	Online	44	2026-08-29 16:09:59.022648
3579	1	Connected	Unknown	Online	41	2026-08-29 16:23:48.5742
3580	1	Connected	Unknown	Online	41	2026-08-29 16:24:08.606333
3582	1	Connected	Unknown	Online	41	2026-08-29 16:24:48.593373
3583	1	Connected	Unknown	Online	41	2026-08-29 16:25:08.577646
3584	1	Connected	Unknown	Online	41	2026-08-29 16:25:28.587894
3586	1	Connected	Unknown	Online	41	2026-08-29 16:26:08.620383
3590	1	Connected	Unknown	Online	40	2026-08-29 16:27:28.603814
3600	1	Connected	Unknown	Online	40	2026-08-29 16:30:48.692481
3601	1	Connected	Unknown	Online	40	2026-08-29 16:31:08.662824
3639	1	Connected	Unknown	Online	37	2026-08-29 16:44:46.58116
3642	1	Connected	Unknown	Online	37	2026-08-29 16:45:46.557799
3753	1	Connected	Unknown	Online	28	2026-08-29 17:26:51.183708
3756	1	Connected	Unknown	Online	28	2026-08-29 17:27:47.510407
3758	1	\N	\N	Online	\N	2026-08-29 17:27:48.415164
3759	1	Connected	Unknown	Online	28	2026-08-29 17:28:07.425871
3761	1	Connected	Unknown	Online	28	2026-08-29 17:28:27.452307
3763	1	Connected	Unknown	Online	28	2026-08-29 17:29:07.461837
3765	1	Connected	Unknown	Online	28	2026-08-29 17:29:47.446192
3839	1	Unknown	Unknown	Online	\N	2026-08-30 16:29:13.313783
3841	1	Connected	Unknown	Online	8	2026-08-30 16:29:32.366802
3843	1	Connected	Unknown	Online	7	2026-08-30 16:30:12.403597
3845	1	Connected	Unknown	Online	6	2026-08-30 16:30:52.47168
3929	1	Connected	Unknown	Online	24	2026-08-30 16:58:33.684794
3935	1	Connected	Unknown	Online	25	2026-08-30 17:00:33.638172
3936	1	Connected	Unknown	Online	26	2026-08-30 17:00:53.619991
3939	1	Connected	Unknown	Online	26	2026-08-30 17:01:53.68436
3987	1	Connected	Unknown	Online	46	2026-09-06 13:28:50.271451
3989	1	Connected	Unknown	Online	46	2026-09-06 13:29:30.251197
4056	1	Connected	Unknown	Online	41	2026-09-06 13:52:38.260964
4103	1	Connected	Unknown	Online	39	2026-09-06 14:07:21.796253
4142	1	Connected	Unknown	Online	37	2026-09-06 14:19:27.47333
4226	1	Connected	Unknown	Online	31	2026-09-06 14:46:41.114077
4228	1	Connected	Unknown	Online	31	2026-09-06 14:47:21.086568
4229	1	Connected	Unknown	Online	31	2026-09-06 14:47:41.01312
4230	1	Connected	Unknown	Online	31	2026-09-06 14:48:01.019593
4231	1	Connected	Unknown	Online	31	2026-09-06 14:48:21.010881
4232	1	Connected	Unknown	Online	31	2026-09-06 14:48:41.052685
4284	1	Connected	Unknown	Online	26	2026-09-06 15:10:21.411394
4332	1	Connected	Unknown	Online	23	2026-09-06 15:27:01.544885
4335	1	Connected	Unknown	Online	22	2026-09-06 15:28:01.309482
4485	1	Connected	Unknown	Online	14	2026-09-06 16:16:48.789981
4486	1	Connected	Unknown	Online	14	2026-09-06 16:17:08.8001
4491	1	Connected	Unknown	Online	15	2026-09-06 16:18:48.805244
4493	1	Connected	Unknown	Online	16	2026-09-06 16:19:28.859896
4500	1	Connected	Unknown	Online	17	2026-09-06 16:21:48.956504
4503	1	Connected	Unknown	Online	18	2026-09-06 16:22:48.949098
4509	1	Connected	Unknown	Online	19	2026-09-06 16:24:49.091976
4519	1	Connected	Unknown	Online	21	2026-09-06 16:28:09.394196
4521	1	Connected	Unknown	Online	21	2026-09-06 16:28:49.129123
4523	1	Connected	Unknown	Online	22	2026-09-06 16:29:29.374957
4533	1	Connected	Unknown	Online	23	2026-09-06 16:32:49.305788
4534	1	Connected	Unknown	Online	24	2026-09-06 16:33:09.310402
4535	1	Connected	Unknown	Online	24	2026-09-06 16:33:29.295721
4539	1	Connected	Unknown	Online	25	2026-09-06 16:34:49.415489
4541	1	Connected	Unknown	Online	25	2026-09-06 16:35:29.360801
4542	1	Connected	Unknown	Online	25	2026-09-06 16:35:49.42557
4546	1	Connected	Unknown	Online	26	2026-09-06 16:37:09.454724
4548	1	Connected	Unknown	Online	26	2026-09-06 16:37:49.501803
4552	1	Connected	Unknown	Online	27	2026-09-06 16:39:09.618147
4553	1	Connected	Unknown	Online	27	2026-09-06 16:39:29.562869
4554	1	Connected	Unknown	Online	27	2026-09-06 16:39:49.636643
4567	1	Unknown	Unknown	Online	\N	2026-09-06 16:43:44.55515
4570	1	Connected	Unknown	Online	30	2026-09-06 16:44:09.757736
4574	1	Connected	Unknown	Online	30	2026-09-06 16:45:29.779742
4578	1	Connected	Unknown	Online	30	2026-09-06 16:46:49.8682
4580	1	Connected	Unknown	Online	30	2026-09-06 16:47:30.033771
4582	1	Connected	Unknown	Online	29	2026-09-06 16:48:10.113578
4585	1	Connected	Unknown	Online	29	2026-09-06 16:49:10.046054
4613	1	Connected	Unknown	Online	28	2026-09-06 16:58:30.323097
4618	1	Connected	Unknown	Online	27	2026-09-06 17:00:10.419315
4619	1	Connected	Unknown	Online	27	2026-09-06 17:00:30.377964
4621	1	Connected	Unknown	Online	27	2026-09-06 17:01:10.447743
4721	1	Connected	Unknown	Online	23	2026-09-06 17:31:27.120214
4771	1	Unknown	Unknown	Online	\N	2026-09-06 17:47:01.137487
4826	1	Unknown	Unknown	Online	\N	2026-09-06 18:04:47.56504
3186	1	Connected	Active	Online	94	2026-08-26 15:27:45.286028
3290	1	\N	\N	Online	\N	2026-08-29 14:35:08.42859
3391	1	Connected	Unknown	Online	55	2026-08-29 15:08:41.882713
3394	1	Connected	Unknown	Online	55	2026-08-29 15:09:41.883324
3399	1	Connected	Unknown	Online	55	2026-08-29 15:11:21.914828
3401	1	Connected	Unknown	Online	55	2026-08-29 15:12:01.901286
3402	1	Connected	Unknown	Online	55	2026-08-29 15:12:21.911218
3454	1	Connected	Unknown	Online	51	2026-08-29 15:35:08.961867
3455	1	\N	\N	Online	\N	2026-08-29 15:35:08.988709
3460	1	Connected	Unknown	Online	50	2026-08-29 15:36:08.963258
3462	1	Connected	Unknown	Online	50	2026-08-29 15:36:48.965078
3464	1	Connected	Unknown	Online	50	2026-08-29 15:37:09.053243
3543	1	Connected	Unknown	Online	44	2026-08-29 16:11:19.119087
3546	1	Connected	Unknown	Online	43	2026-08-29 16:12:19.034706
3548	1	Connected	Unknown	Online	43	2026-08-29 16:12:59.051214
3581	1	Connected	Unknown	Online	41	2026-08-29 16:24:28.649805
3585	1	Connected	Unknown	Online	41	2026-08-29 16:25:48.594875
3640	1	Connected	Unknown	Online	37	2026-08-29 16:45:06.553409
3641	1	Connected	Unknown	Online	37	2026-08-29 16:45:26.554995
3754	1	Connected	Unknown	Online	28	2026-08-29 17:27:11.193285
3840	1	Unknown	Unknown	Online	\N	2026-08-30 16:29:22.27694
3842	1	Connected	Unknown	Online	8	2026-08-30 16:29:52.357069
3931	1	Connected	Unknown	Online	24	2026-08-30 16:59:13.558487
3933	1	Connected	Unknown	Online	25	2026-08-30 16:59:53.629077
3934	1	Connected	Unknown	Online	25	2026-08-30 17:00:13.581705
3937	1	Connected	Unknown	Online	26	2026-08-30 17:01:13.644076
3938	1	Connected	Unknown	Online	26	2026-08-30 17:01:33.763844
3942	1	Connected	Unknown	Online	27	2026-08-30 17:02:53.716384
3943	1	Connected	Unknown	Online	28	2026-08-30 17:04:04.617893
3988	1	Connected	Unknown	Online	46	2026-09-06 13:29:10.310664
3990	1	Connected	Unknown	Online	46	2026-09-06 13:29:50.220944
4057	1	Connected	Unknown	Online	41	2026-09-06 13:52:51.230873
4104	1	Connected	Unknown	Online	39	2026-09-06 14:07:41.850339
4143	1	Connected	Unknown	Online	37	2026-09-06 14:19:47.524569
4233	1	Connected	Unknown	Online	31	2026-09-06 14:49:01.066258
4236	1	Connected	Unknown	Online	31	2026-09-06 14:50:01.051113
4285	1	Connected	Unknown	Online	26	2026-09-06 15:10:41.410311
4287	1	Connected	Unknown	Online	26	2026-09-06 15:11:21.453835
4288	1	Connected	Unknown	Online	25	2026-09-06 15:11:41.410776
4333	1	Connected	Unknown	Online	22	2026-09-06 15:27:21.398063
4487	1	Connected	Unknown	Online	14	2026-09-06 16:17:28.769909
4497	1	Connected	Unknown	Online	17	2026-09-06 16:20:48.990077
4498	1	Connected	Unknown	Online	17	2026-09-06 16:21:08.934133
4502	1	Connected	Unknown	Online	18	2026-09-06 16:22:29.114774
4505	1	Connected	Unknown	Online	18	2026-09-06 16:23:28.983582
4507	1	Connected	Unknown	Online	19	2026-09-06 16:24:09.002765
4508	1	Connected	Unknown	Online	19	2026-09-06 16:24:28.995709
4513	1	Connected	Unknown	Online	20	2026-09-06 16:26:09.141545
4514	1	Connected	Unknown	Online	20	2026-09-06 16:26:29.076904
4518	1	Connected	Unknown	Online	21	2026-09-06 16:27:49.121848
417	1	Connected	Unknown	Online	36	2026-08-02 01:29:47.518047
418	1	Connected	Unknown	Online	36	2026-08-02 01:29:47.570419
419	1	\N	\N	Online	\N	2026-08-02 01:29:53.314368
420	1	\N	\N	Online	\N	2026-08-02 01:29:53.459439
421	1	Connected	Active	Online	36	2026-08-02 01:30:06.953674
422	1	\N	\N	Online	\N	2026-08-02 01:30:23.339195
423	1	Connected	Active	Online	37	2026-08-02 01:30:26.951343
424	1	\N	\N	Online	\N	2026-08-02 01:30:27.079606
425	1	Connected	Active	Online	37	2026-08-02 01:30:46.969367
426	1	\N	\N	Online	\N	2026-08-02 01:30:53.345605
427	1	Connected	Active	Online	37	2026-08-02 01:31:06.976825
428	1	Disconnected	Active	Online	0	2026-08-02 01:31:08.694678
430	1	Connected	Unknown	Online	10	2026-08-03 17:05:12.327976
429	1	Connected	Unknown	Online	10	2026-08-03 17:05:12.322919
431	1	\N	\N	Online	\N	2026-08-03 17:05:13.526224
432	1	\N	\N	Online	\N	2026-08-03 17:05:13.529959
433	1	Connected	Active	Online	10	2026-08-03 17:05:29.471902
434	1	\N	\N	Online	\N	2026-08-03 17:05:29.485509
435	1	Connected	Active	Online	10	2026-08-03 17:05:50.195059
436	1	\N	\N	Online	\N	2026-08-03 17:05:50.261522
437	1	Disconnected	Active	Online	0	2026-08-03 17:06:00.484899
438	1	Connected	Active	Online	10	2026-08-03 17:06:10.546048
439	1	\N	\N	Online	\N	2026-08-03 17:06:10.591228
440	1	\N	\N	Online	\N	2026-08-03 17:06:30.269864
441	1	Connected	Active	Online	10	2026-08-03 17:06:30.282017
442	1	Connected	Active	Online	10	2026-08-03 17:06:50.313484
443	1	\N	\N	Online	\N	2026-08-03 17:06:50.319021
444	1	Connected	Active	Online	10	2026-08-03 17:07:10.14182
445	1	\N	\N	Online	\N	2026-08-03 17:07:10.223792
446	1	Connected	Active	Online	10	2026-08-03 17:07:30.508293
447	1	\N	\N	Online	\N	2026-08-03 17:07:30.575639
448	1	\N	\N	Online	\N	2026-08-03 17:07:50.393429
449	1	Connected	Active	Online	10	2026-08-03 17:07:50.395701
450	1	Connected	Active	Online	17	2026-08-03 17:08:09.678694
451	1	\N	\N	Online	\N	2026-08-03 17:08:09.680421
452	1	Connected	Active	Online	18	2026-08-03 17:08:29.316709
453	1	\N	\N	Online	\N	2026-08-03 17:08:29.347088
454	1	Connected	Active	Online	19	2026-08-03 17:08:49.338448
455	1	\N	\N	Online	\N	2026-08-03 17:08:49.339232
456	1	Connected	Active	Online	20	2026-08-03 17:09:09.851186
457	1	\N	\N	Online	\N	2026-08-03 17:09:09.979322
458	1	\N	\N	Online	\N	2026-08-03 17:09:31.86828
459	1	Connected	Active	Online	22	2026-08-03 17:09:31.86938
460	1	Connected	Active	Online	23	2026-08-03 17:09:52.640062
461	1	\N	\N	Online	\N	2026-08-03 17:09:52.640415
462	1	Connected	Active	Online	23	2026-08-03 17:10:09.355053
463	1	\N	\N	Online	\N	2026-08-03 17:10:09.410012
464	1	Connected	Active	Online	24	2026-08-03 17:10:30.356442
465	1	\N	\N	Online	\N	2026-08-03 17:10:30.359482
466	1	Connected	Unknown	Online	25	2026-08-03 17:10:45.732589
467	1	Connected	Unknown	Online	25	2026-08-03 17:10:45.73649
468	1	\N	\N	Online	\N	2026-08-03 17:10:49.390744
469	1	\N	\N	Online	\N	2026-08-03 17:10:49.391061
470	1	Connected	Unknown	Online	25	2026-08-03 17:10:56.332732
471	1	Connected	Unknown	Online	25	2026-08-03 17:10:56.344511
472	1	\N	\N	Online	\N	2026-08-03 17:10:56.455202
473	1	\N	\N	Online	\N	2026-08-03 17:10:56.460643
474	1	\N	\N	Online	\N	2026-08-03 17:11:16.447993
475	1	Connected	Active	Online	26	2026-08-03 17:11:16.448606
476	1	Connected	Active	Online	27	2026-08-03 17:11:37.283022
477	1	\N	\N	Online	\N	2026-08-03 17:11:37.319753
478	1	\N	\N	Online	\N	2026-08-03 17:11:56.477208
479	1	Connected	Active	Online	28	2026-08-03 17:11:56.477901
480	1	\N	\N	Online	\N	2026-08-03 17:12:17.758175
481	1	Connected	Active	Online	29	2026-08-03 17:12:17.761802
482	1	\N	\N	Online	\N	2026-08-03 17:12:36.574224
483	1	Connected	Active	Online	29	2026-08-03 17:12:36.574787
486	1	\N	\N	Online	\N	2026-08-03 17:13:16.464382
484	1	Connected	Active	Online	30	2026-08-03 17:12:56.434547
485	1	\N	\N	Online	\N	2026-08-03 17:12:56.477968
495	1	Connected	Active	Online	31	2026-08-03 17:14:43.348968
496	1	\N	\N	Online	\N	2026-08-03 17:14:43.427709
1233	1	\N	\N	Online	\N	2026-08-08 01:01:02.324083
3187	1	Connected	Active	Online	94	2026-08-26 15:28:05.239785
3188	1	Connected	Active	Online	94	2026-08-26 15:28:25.220891
3189	1	\N	\N	Online	\N	2026-08-26 15:28:45.228306
3293	1	Connected	Active	Online	60	2026-08-29 14:35:48.233957
3294	1	Disconnected	Active	Online	0	2026-08-29 14:36:03.12735
3295	1	\N	\N	Online	\N	2026-08-29 14:36:45.754668
3296	1	\N	\N	Online	\N	2026-08-29 14:36:45.790617
3395	1	Connected	Unknown	Online	55	2026-08-29 15:10:01.8817
3396	1	Connected	Unknown	Online	55	2026-08-29 15:10:21.890369
3456	1	\N	\N	Online	\N	2026-08-29 15:35:09.208659
3457	1	Connected	Unknown	Online	51	2026-08-29 15:35:28.927715
3459	1	Connected	Unknown	Online	50	2026-08-29 15:35:48.949733
3544	1	Connected	Unknown	Online	43	2026-08-29 16:11:39.086482
3587	1	Connected	Unknown	Online	41	2026-08-29 16:26:28.602808
3588	1	Connected	Unknown	Online	41	2026-08-29 16:26:48.741363
3643	1	Connected	Unknown	Online	36	2026-08-29 16:51:17.885743
3647	1	\N	\N	Online	\N	2026-08-29 16:51:48.895733
3760	1	\N	\N	Online	\N	2026-08-29 17:28:13.205406
3762	1	Connected	Unknown	Online	28	2026-08-29 17:28:47.498266
3764	1	Connected	Unknown	Online	28	2026-08-29 17:29:27.461249
3846	1	Connected	Unknown	Online	6	2026-08-30 16:31:12.506977
3847	1	Connected	Unknown	Online	6	2026-08-30 16:31:32.412258
3849	1	Connected	Unknown	Online	6	2026-08-30 16:32:12.472868
3851	1	Connected	Unknown	Online	7	2026-08-30 16:32:52.516496
3853	1	Connected	Unknown	Online	7	2026-08-30 16:33:32.533824
3860	1	Connected	Unknown	Online	9	2026-08-30 16:35:52.628602
3861	1	Connected	Unknown	Online	9	2026-08-30 16:36:12.628949
3864	1	Connected	Unknown	Online	10	2026-08-30 16:37:12.675276
3870	1	Connected	Unknown	Online	11	2026-08-30 16:39:12.715134
3872	1	Connected	Unknown	Online	12	2026-08-30 16:39:52.737801
3876	1	Connected	Unknown	Online	12	2026-08-30 16:41:12.804522
3880	1	Connected	Unknown	Online	13	2026-08-30 16:42:32.872031
3881	1	Connected	Unknown	Online	13	2026-08-30 16:42:52.849447
3890	1	Connected	Unknown	Online	15	2026-08-30 16:45:52.966645
3940	1	Connected	Unknown	Online	27	2026-08-30 17:02:13.71031
3941	1	Connected	Unknown	Online	27	2026-08-30 17:02:33.669772
3991	1	Connected	Unknown	Online	45	2026-09-06 13:30:32.810686
3993	1	Unknown	Unknown	Online	\N	2026-09-06 13:30:35.548576
4058	1	Connected	Unknown	Online	41	2026-09-06 13:53:11.209062
4105	1	Connected	Unknown	Online	39	2026-09-06 14:08:01.822788
4145	1	Connected	Unknown	Online	37	2026-09-06 14:20:27.498542
4234	1	Connected	Unknown	Online	31	2026-09-06 14:49:21.180237
4238	1	Connected	Unknown	Online	30	2026-09-06 14:50:41.050111
4286	1	Connected	Unknown	Online	26	2026-09-06 15:11:01.365804
4334	1	Connected	Unknown	Online	22	2026-09-06 15:27:41.348756
4342	1	Connected	Unknown	Online	22	2026-09-06 15:30:21.47829
4343	1	Connected	Unknown	Online	22	2026-09-06 15:30:41.468194
4344	1	Connected	Unknown	Online	22	2026-09-06 15:31:01.528334
4345	1	Connected	Unknown	Online	22	2026-09-06 15:31:21.497123
4346	1	Connected	Unknown	Online	22	2026-09-06 15:31:41.525932
4347	1	Connected	Unknown	Online	22	2026-09-06 15:32:01.599446
4357	1	Connected	Unknown	Online	20	2026-09-06 15:35:21.685634
4358	1	Connected	Unknown	Online	20	2026-09-06 15:35:41.693575
4359	1	Connected	Unknown	Online	20	2026-09-06 15:36:01.66668
4360	1	Connected	Unknown	Online	20	2026-09-06 15:36:21.706612
4361	1	Connected	Unknown	Online	20	2026-09-06 15:36:41.726068
4365	1	Connected	Unknown	Online	20	2026-09-06 15:38:01.750752
4488	1	Connected	Unknown	Online	15	2026-09-06 16:17:48.786029
4499	1	Connected	Unknown	Online	17	2026-09-06 16:21:28.883416
4501	1	Connected	Unknown	Online	17	2026-09-06 16:22:09.215053
4504	1	Connected	Unknown	Online	18	2026-09-06 16:23:08.988015
4512	1	Connected	Unknown	Online	20	2026-09-06 16:25:49.154271
4515	1	Connected	Unknown	Online	20	2026-09-06 16:26:49.132712
4524	1	Connected	Unknown	Online	22	2026-09-06 16:29:49.200188
4525	1	Connected	Unknown	Online	22	2026-09-06 16:30:09.193349
4540	1	Connected	Unknown	Online	25	2026-09-06 16:35:09.35217
4547	1	Connected	Unknown	Online	26	2026-09-06 16:37:29.52414
4551	1	Connected	Unknown	Online	27	2026-09-06 16:38:49.608609
4564	1	Connected	Unknown	Online	29	2026-09-06 16:43:09.716078
4568	1	Unknown	Unknown	Online	\N	2026-09-06 16:43:44.572501
4569	1	Connected	Unknown	Online	30	2026-09-06 16:43:49.67753
4614	1	Connected	Unknown	Online	28	2026-09-06 16:58:50.340549
4615	1	Connected	Unknown	Online	27	2026-09-06 16:59:10.350208
4623	1	Connected	Unknown	Online	27	2026-09-06 17:01:50.496485
4625	1	Connected	Unknown	Online	27	2026-09-06 17:02:30.515284
4723	1	Connected	Unknown	Online	23	2026-09-06 17:32:07.13001
4724	1	Connected	Unknown	Online	23	2026-09-06 17:32:27.269708
4729	1	Connected	Unknown	Online	23	2026-09-06 17:34:07.255549
4730	1	Connected	Unknown	Online	24	2026-09-06 17:34:27.259792
4732	1	Connected	Unknown	Online	24	2026-09-06 17:35:07.382413
4739	1	Connected	Unknown	Online	25	2026-09-06 17:37:27.416493
4772	1	Connected	Unknown	Online	31	2026-09-06 17:47:19.300869
4827	1	Unknown	Unknown	Online	\N	2026-09-06 18:04:47.624242
487	1	Connected	Active	Online	31	2026-08-03 17:13:16.465278
488	1	Disconnected	Active	Online	0	2026-08-03 17:13:34.414572
489	1	Connected	Active	Online	31	2026-08-03 17:13:37.089204
490	1	\N	\N	Online	\N	2026-08-03 17:13:37.091683
491	1	Connected	Active	Online	31	2026-08-03 17:13:57.1399
492	1	\N	\N	Online	\N	2026-08-03 17:13:57.172768
493	1	Connected	Active	Online	31	2026-08-03 17:14:17.158359
494	1	\N	\N	Online	\N	2026-08-03 17:14:17.170673
497	1	Connected	Active	Online	31	2026-08-03 17:15:43.358685
498	1	\N	\N	Online	\N	2026-08-03 17:15:43.394798
3190	1	Connected	Active	Online	94	2026-08-26 15:28:45.295575
3297	1	\N	\N	Online	\N	2026-08-29 14:36:45.833512
3397	1	Connected	Unknown	Online	55	2026-08-29 15:10:41.913588
3398	1	Connected	Unknown	Online	55	2026-08-29 15:11:01.899647
3458	1	\N	\N	Online	\N	2026-08-29 15:35:30.319601
3545	1	Connected	Unknown	Online	43	2026-08-29 16:11:59.045853
3589	1	Connected	Unknown	Online	41	2026-08-29 16:27:08.6139
3644	1	Connected	Unknown	Online	36	2026-08-29 16:51:42.275541
3656	1	Connected	Unknown	Online	35	2026-08-29 16:54:42.230237
3658	1	Connected	Unknown	Online	35	2026-08-29 16:55:22.245997
3660	1	Connected	Unknown	Online	35	2026-08-29 16:56:02.251433
510	1	Connected	Active	Online	31	2026-08-03 17:19:57.462143
511	1	\N	\N	Online	\N	2026-08-03 17:19:57.787958
512	1	Disconnected	Active	Online	0	2026-08-03 17:19:57.930704
3662	1	Connected	Unknown	Online	35	2026-08-29 16:56:42.264616
3664	1	Connected	Unknown	Online	34	2026-08-29 16:57:22.259567
3666	1	Connected	Unknown	Online	34	2026-08-29 16:58:02.266987
3676	1	Connected	Unknown	Online	33	2026-08-29 17:01:22.318789
3677	1	Connected	Unknown	Online	33	2026-08-29 17:01:42.334218
3848	1	Connected	Unknown	Online	6	2026-08-30 16:31:52.52827
3850	1	Connected	Unknown	Online	6	2026-08-30 16:32:32.594633
3852	1	Connected	Unknown	Online	7	2026-08-30 16:33:12.518202
3855	1	Connected	Unknown	Online	8	2026-08-30 16:34:12.505047
3856	1	Connected	Unknown	Online	8	2026-08-30 16:34:32.566931
3944	1	Connected	Unknown	Online	28	2026-08-30 17:04:24.142727
3945	1	Connected	Unknown	Online	28	2026-08-30 17:04:44.151567
3946	1	Connected	Unknown	Online	28	2026-08-30 17:05:04.152621
3992	1	Unknown	Unknown	Online	\N	2026-09-06 13:30:35.204289
3994	1	Connected	Unknown	Online	45	2026-09-06 13:30:52.341922
3996	1	Connected	Unknown	Online	45	2026-09-06 13:31:12.386771
3997	1	Connected	Unknown	Online	45	2026-09-06 13:31:32.394897
3998	1	Connected	Unknown	Online	45	2026-09-06 13:31:52.402057
4000	1	Connected	Unknown	Online	45	2026-09-06 13:32:32.426938
4003	1	Connected	Unknown	Online	45	2026-09-06 13:33:32.508905
4005	1	Connected	Unknown	Online	45	2026-09-06 13:34:12.430978
4011	1	Connected	Unknown	Online	45	2026-09-06 13:36:12.447515
4013	1	Connected	Unknown	Online	45	2026-09-06 13:36:52.465447
4016	1	Connected	Unknown	Online	44	2026-09-06 13:37:52.483734
4017	1	Connected	Unknown	Online	44	2026-09-06 13:38:12.499755
4059	1	Connected	Unknown	Online	41	2026-09-06 13:53:31.217525
4106	1	Connected	Unknown	Online	39	2026-09-06 14:08:21.791244
4146	1	Connected	Unknown	Online	37	2026-09-06 14:20:47.61322
4148	1	Connected	Unknown	Online	37	2026-09-06 14:21:27.49479
4235	1	Connected	Unknown	Online	31	2026-09-06 14:49:41.047273
4237	1	Connected	Unknown	Online	31	2026-09-06 14:50:21.084909
4289	1	Connected	Unknown	Online	25	2026-09-06 15:12:01.575205
4290	1	Connected	Unknown	Online	25	2026-09-06 15:12:21.455423
4291	1	Connected	Unknown	Online	25	2026-09-06 15:12:41.403109
4336	1	Connected	Unknown	Online	22	2026-09-06 15:28:21.382556
4338	1	Connected	Unknown	Online	22	2026-09-06 15:29:01.412913
4348	1	Connected	Unknown	Online	22	2026-09-06 15:32:21.576039
4349	1	Connected	Unknown	Online	22	2026-09-06 15:32:41.570592
4350	1	Connected	Unknown	Online	22	2026-09-06 15:33:01.574553
4351	1	Connected	Unknown	Online	21	2026-09-06 15:33:21.57298
4352	1	Connected	Unknown	Online	21	2026-09-06 15:33:41.581973
4353	1	Connected	Unknown	Online	21	2026-09-06 15:34:01.718713
4354	1	Connected	Unknown	Online	21	2026-09-06 15:34:21.634062
4355	1	Connected	Unknown	Online	20	2026-09-06 15:34:41.633271
4356	1	Connected	Unknown	Online	20	2026-09-06 15:35:01.771868
4362	1	Connected	Unknown	Online	20	2026-09-06 15:37:01.700498
4363	1	Connected	Unknown	Online	20	2026-09-06 15:37:21.724369
4364	1	Connected	Unknown	Online	20	2026-09-06 15:37:41.743132
4366	1	Connected	Unknown	Online	20	2026-09-06 15:38:21.713307
4490	1	Connected	Unknown	Online	15	2026-09-06 16:18:28.811363
4494	1	Connected	Unknown	Online	16	2026-09-06 16:19:48.842154
4495	1	Connected	Unknown	Online	16	2026-09-06 16:20:08.924181
4496	1	Connected	Unknown	Online	16	2026-09-06 16:20:28.864965
4506	1	Connected	Unknown	Online	18	2026-09-06 16:23:49.014644
4510	1	Connected	Unknown	Online	19	2026-09-06 16:25:09.037067
4511	1	Connected	Unknown	Online	19	2026-09-06 16:25:29.053258
4516	1	Connected	Unknown	Online	20	2026-09-06 16:27:09.081579
4517	1	Connected	Unknown	Online	21	2026-09-06 16:27:29.081733
4522	1	Connected	Unknown	Online	21	2026-09-06 16:29:09.204596
4527	1	Connected	Unknown	Online	22	2026-09-06 16:30:49.165036
4528	1	Connected	Unknown	Online	22	2026-09-06 16:31:09.311228
4536	1	Connected	Unknown	Online	24	2026-09-06 16:33:49.35688
4538	1	Connected	Unknown	Online	24	2026-09-06 16:34:29.346298
4556	1	Connected	Unknown	Online	28	2026-09-06 16:40:29.778659
4557	1	Connected	Unknown	Online	28	2026-09-06 16:40:49.620296
4563	1	Connected	Unknown	Online	29	2026-09-06 16:42:49.769755
4571	1	Connected	Unknown	Online	30	2026-09-06 16:44:29.800167
4616	1	Connected	Unknown	Online	27	2026-09-06 16:59:30.386372
4626	1	Connected	Unknown	Online	27	2026-09-06 17:02:50.538773
4628	1	Connected	Unknown	Online	27	2026-09-06 17:03:30.58929
4727	1	Connected	Unknown	Online	23	2026-09-06 17:33:27.267037
4776	1	Connected	Unknown	Online	31	2026-09-06 17:48:39.390375
4777	1	Connected	Unknown	Online	31	2026-09-06 17:48:49.418598
4781	1	Connected	Unknown	Online	31	2026-09-06 17:49:09.187311
4828	1	Unknown	Unknown	Online	\N	2026-09-06 18:04:47.663462
3191	1	Connected	Active	Online	94	2026-08-26 15:29:17.282045
3192	1	\N	\N	Online	\N	2026-08-26 15:29:45.213181
3298	1	Connected	Inactive	Online	60	2026-08-29 14:36:45.851736
1234	1	Connected	Active	Online	19	2026-08-08 01:01:02.391248
1235	1	Connected	Active	Online	19	2026-08-08 01:01:22.373786
1236	1	Connected	Active	Online	19	2026-08-08 01:01:42.426387
1237	1	\N	\N	Online	\N	2026-08-08 01:02:02.66803
3303	1	Connected	Active	Online	60	2026-08-29 14:37:25.678044
3304	1	Connected	Active	Online	60	2026-08-29 14:37:45.690238
3305	1	\N	\N	Online	\N	2026-08-29 14:37:45.770487
3400	1	Connected	Unknown	Online	55	2026-08-29 15:11:41.914046
3403	1	Connected	Unknown	Online	54	2026-08-29 15:12:41.914846
3405	1	Connected	Unknown	Online	54	2026-08-29 15:13:21.905819
3461	1	Connected	Unknown	Online	50	2026-08-29 15:36:28.968605
3463	1	Connected	Active	Online	100	2026-08-29 15:37:02.747993
3547	1	Connected	Unknown	Online	43	2026-08-29 16:12:39.050837
3591	1	Connected	Unknown	Online	40	2026-08-29 16:27:48.659693
3592	1	Connected	Unknown	Online	40	2026-08-29 16:28:08.742915
3593	1	Connected	Unknown	Online	40	2026-08-29 16:28:28.621995
3597	1	Connected	Unknown	Online	40	2026-08-29 16:29:48.615356
3602	1	Connected	Unknown	Online	40	2026-08-29 16:31:28.731938
3645	1	\N	\N	Online	\N	2026-08-29 16:51:43.668592
3766	1	Connected	Unknown	Online	80	2026-08-30 12:55:23.965463
3768	1	\N	\N	Online	\N	2026-08-30 12:55:25.589296
3772	1	Connected	Unknown	Online	80	2026-08-30 12:56:23.649759
3774	1	Connected	Unknown	Online	79	2026-08-30 12:57:03.692494
3779	1	Connected	Unknown	Online	79	2026-08-30 12:58:43.690191
3783	1	Connected	Unknown	Online	79	2026-08-30 13:00:03.768284
3785	1	Connected	Unknown	Online	79	2026-08-30 13:00:43.700991
3786	1	Connected	Unknown	Online	79	2026-08-30 13:01:03.698552
3787	1	Connected	Unknown	Online	79	2026-08-30 13:01:23.702903
3789	1	Connected	Unknown	Online	79	2026-08-30 13:02:03.776212
3796	1	Connected	Unknown	Online	79	2026-08-30 13:04:23.765165
3797	1	Connected	Unknown	Online	79	2026-08-30 13:04:43.79228
3802	1	Connected	Unknown	Online	78	2026-08-30 13:06:23.771379
3803	1	Connected	Unknown	Online	78	2026-08-30 13:06:43.857552
3808	1	Connected	Unknown	Online	78	2026-08-30 13:08:23.786329
3816	1	Connected	Unknown	Online	78	2026-08-30 13:11:03.842095
3854	1	Connected	Unknown	Online	7	2026-08-30 16:33:52.56833
3947	1	Connected	Unknown	Online	29	2026-08-30 17:05:24.191834
3995	1	Unknown	Unknown	Online	\N	2026-09-06 13:30:54.849922
3999	1	Connected	Unknown	Online	45	2026-09-06 13:32:12.430209
4002	1	Connected	Unknown	Online	45	2026-09-06 13:33:12.552613
4060	1	Connected	Unknown	Online	41	2026-09-06 13:53:51.238644
4107	1	Connected	Unknown	Online	39	2026-09-06 14:08:41.91205
4147	1	Connected	Unknown	Online	37	2026-09-06 14:21:07.481685
4149	1	Connected	Unknown	Online	37	2026-09-06 14:21:47.48397
4150	1	Connected	Unknown	Online	37	2026-09-06 14:22:07.499198
4239	1	Connected	Unknown	Online	30	2026-09-06 14:51:01.094764
4292	1	Connected	Unknown	Online	25	2026-09-06 15:13:01.431736
4293	1	Connected	Unknown	Online	24	2026-09-06 15:13:21.487579
4301	1	Connected	Unknown	Online	24	2026-09-06 15:16:01.467326
4302	1	Connected	Unknown	Online	24	2026-09-06 15:16:21.500659
4306	1	Connected	Unknown	Online	24	2026-09-06 15:17:41.523671
4311	1	Connected	Unknown	Online	24	2026-09-06 15:19:01.523254
4313	1	Connected	Unknown	Online	24	2026-09-06 15:19:41.600234
4315	1	Connected	Unknown	Online	24	2026-09-06 15:20:21.574326
4316	1	Connected	Unknown	Online	24	2026-09-06 15:20:41.60804
4318	1	Connected	Unknown	Online	23	2026-09-06 15:21:21.596272
4337	1	Connected	Unknown	Online	22	2026-09-06 15:28:41.423659
4340	1	Connected	Unknown	Online	22	2026-09-06 15:29:41.431091
4526	1	Connected	Unknown	Online	22	2026-09-06 16:30:29.392859
4531	1	Connected	Unknown	Online	23	2026-09-06 16:32:09.382243
4544	1	Connected	Unknown	Online	26	2026-09-06 16:36:29.388546
4549	1	Connected	Unknown	Online	26	2026-09-06 16:38:09.50638
4555	1	Connected	Unknown	Online	28	2026-09-06 16:40:09.62318
4560	1	Connected	Unknown	Online	29	2026-09-06 16:41:49.830656
4562	1	Connected	Unknown	Online	29	2026-09-06 16:42:29.853757
4573	1	Connected	Unknown	Online	30	2026-09-06 16:45:09.849696
4575	1	Connected	Unknown	Online	30	2026-09-06 16:45:49.821226
4576	1	Connected	Unknown	Online	30	2026-09-06 16:46:10.293794
4577	1	Connected	Unknown	Online	30	2026-09-06 16:46:31.037406
4579	1	Connected	Unknown	Online	30	2026-09-06 16:47:09.844139
4581	1	Connected	Unknown	Online	30	2026-09-06 16:47:49.900777
4583	1	Connected	Unknown	Online	29	2026-09-06 16:48:35.323864
4588	1	Connected	Unknown	Online	29	2026-09-06 16:50:10.089923
4592	1	Connected	Unknown	Online	29	2026-09-06 16:51:30.124668
4598	1	Connected	Unknown	Online	29	2026-09-06 16:53:30.362882
4606	1	Connected	Unknown	Online	28	2026-09-06 16:56:10.314556
4607	1	Connected	Unknown	Online	28	2026-09-06 16:56:30.258036
4610	1	Connected	Unknown	Online	28	2026-09-06 16:57:30.278972
4617	1	Connected	Unknown	Online	27	2026-09-06 16:59:50.468765
4622	1	Connected	Unknown	Online	27	2026-09-06 17:01:30.451227
4728	1	Connected	Unknown	Online	23	2026-09-06 17:33:47.244578
4731	1	Connected	Unknown	Online	24	2026-09-06 17:34:47.269186
4779	1	Unknown	Unknown	Online	\N	2026-09-06 17:48:50.422016
4782	1	Connected	Unknown	Online	31	2026-09-06 17:49:29.328672
4786	1	Connected	Unknown	Online	31	2026-09-06 17:50:49.256403
4829	1	Connected	Unknown	Online	33	2026-09-06 18:04:50.832358
4830	1	Connected	Unknown	Online	33	2026-09-06 18:05:10.843123
4835	1	Connected	Unknown	Online	33	2026-09-06 18:06:50.999157
4836	1	Connected	Unknown	Online	33	2026-09-06 18:07:10.969654
4840	1	Connected	Unknown	Online	33	2026-09-06 18:08:31.359455
4843	1	Connected	Unknown	Online	33	2026-09-06 18:09:31.062931
3193	1	Connected	Active	Online	94	2026-08-26 15:30:17.220295
3194	1	\N	\N	Online	\N	2026-08-26 15:30:45.215967
3299	1	Connected	Inactive	Online	60	2026-08-29 14:36:45.894027
3300	1	Disconnected	Active	Online	0	2026-08-29 14:36:46.032467
3301	1	Connected	Active	Online	60	2026-08-29 14:37:05.67841
3302	1	\N	\N	Online	\N	2026-08-29 14:37:15.73181
3404	1	Connected	Unknown	Online	54	2026-08-29 15:13:01.929774
1238	1	Connected	Active	Online	19	2026-08-08 01:02:02.817584
1239	1	Connected	Active	Online	19	2026-08-08 01:02:22.429628
1240	1	Connected	Active	Online	19	2026-08-08 01:02:42.46017
1241	1	\N	\N	Online	\N	2026-08-08 01:03:02.333876
3406	1	Connected	Unknown	Online	54	2026-08-29 15:13:41.923055
3407	1	Connected	Unknown	Online	54	2026-08-29 15:14:01.930187
3412	1	Connected	Unknown	Online	54	2026-08-29 15:15:41.963505
3416	1	Connected	Unknown	Online	54	2026-08-29 15:17:01.954279
3417	1	Connected	Unknown	Online	54	2026-08-29 15:17:21.957857
3418	1	Connected	Unknown	Online	54	2026-08-29 15:17:41.956385
3465	1	Connected	Unknown	Online	50	2026-08-29 15:38:25.519949
3466	1	\N	\N	Online	\N	2026-08-29 15:38:26.033771
3549	1	Connected	Unknown	Online	43	2026-08-29 16:13:19.063331
3558	1	Connected	Unknown	Online	42	2026-08-29 16:16:48.48405
3594	1	Connected	Unknown	Online	40	2026-08-29 16:28:48.62623
3596	1	Connected	Unknown	Online	40	2026-08-29 16:29:28.628004
3646	1	\N	\N	Online	\N	2026-08-29 16:51:44.019691
3649	1	Connected	Unknown	Online	35	2026-08-29 16:52:22.209223
3767	1	\N	\N	Online	\N	2026-08-30 12:55:25.185529
3771	1	Connected	Unknown	Online	80	2026-08-30 12:56:03.641915
3776	1	Connected	Unknown	Online	79	2026-08-30 12:57:43.651579
3790	1	Connected	Unknown	Online	79	2026-08-30 13:02:23.749751
3794	1	Connected	Unknown	Online	79	2026-08-30 13:03:43.749674
3798	1	Connected	Unknown	Online	78	2026-08-30 13:05:03.816966
3800	1	Connected	Unknown	Online	78	2026-08-30 13:05:43.749989
3804	1	Connected	Unknown	Online	78	2026-08-30 13:07:03.816497
3814	1	Connected	Unknown	Online	78	2026-08-30 13:10:23.82901
3857	1	Connected	Unknown	Online	8	2026-08-30 16:34:52.670411
3863	1	Connected	Unknown	Online	9	2026-08-30 16:36:52.729829
3865	1	Connected	Unknown	Online	10	2026-08-30 16:37:32.651656
3866	1	Connected	Unknown	Online	10	2026-08-30 16:37:52.657878
3868	1	Connected	Unknown	Online	11	2026-08-30 16:38:32.707046
3869	1	Connected	Unknown	Online	11	2026-08-30 16:38:52.685172
3874	1	Connected	Unknown	Online	12	2026-08-30 16:40:32.756341
3879	1	Connected	Unknown	Online	12	2026-08-30 16:42:12.817454
3882	1	Connected	Unknown	Online	13	2026-08-30 16:43:12.842842
3884	1	Connected	Unknown	Online	14	2026-08-30 16:43:52.908042
3892	1	Connected	Unknown	Online	16	2026-08-30 16:46:33.010274
3893	1	Connected	Unknown	Online	16	2026-08-30 16:46:52.997847
3897	1	Connected	Unknown	Online	17	2026-08-30 16:48:13.038808
3948	1	Connected	Unknown	Online	29	2026-08-30 17:05:44.257592
3950	1	Connected	Unknown	Online	29	2026-08-30 17:06:24.270937
4001	1	Connected	Unknown	Online	45	2026-09-06 13:32:52.441814
4004	1	Connected	Unknown	Online	45	2026-09-06 13:33:52.448953
4006	1	Connected	Unknown	Online	45	2026-09-06 13:34:32.427605
4007	1	Connected	Unknown	Online	45	2026-09-06 13:34:52.457778
4008	1	Connected	Unknown	Online	45	2026-09-06 13:35:12.431331
4009	1	Connected	Unknown	Online	45	2026-09-06 13:35:32.48207
4010	1	Connected	Unknown	Online	45	2026-09-06 13:35:52.468957
4012	1	Connected	Unknown	Online	45	2026-09-06 13:36:32.705482
4014	1	Connected	Unknown	Online	45	2026-09-06 13:37:12.49546
4015	1	Connected	Unknown	Online	44	2026-09-06 13:37:32.48211
4061	1	Connected	Unknown	Online	41	2026-09-06 13:54:11.282185
4108	1	Connected	Unknown	Online	38	2026-09-06 14:09:01.797867
4151	1	Connected	Unknown	Online	36	2026-09-06 14:22:27.52487
4152	1	Connected	Unknown	Online	36	2026-09-06 14:22:47.509041
4240	1	Connected	Unknown	Online	30	2026-09-06 14:51:21.138679
4243	1	Connected	Unknown	Online	30	2026-09-06 14:52:21.201799
4253	1	Connected	Unknown	Online	30	2026-09-06 14:55:41.180134
4294	1	Connected	Unknown	Online	24	2026-09-06 15:13:41.474126
4339	1	Connected	Unknown	Online	22	2026-09-06 15:29:21.407092
4341	1	Connected	Unknown	Online	22	2026-09-06 15:30:01.533178
4584	1	Connected	Unknown	Online	29	2026-09-06 16:48:49.961178
4589	1	Connected	Unknown	Online	29	2026-09-06 16:50:30.000765
4591	1	Connected	Unknown	Online	29	2026-09-06 16:51:10.39409
4593	1	Connected	Unknown	Online	29	2026-09-06 16:51:50.109208
4602	1	Connected	Unknown	Online	28	2026-09-06 16:54:50.310218
4603	1	Connected	Unknown	Online	28	2026-09-06 16:55:10.198206
4611	1	Connected	Unknown	Online	28	2026-09-06 16:57:50.329315
4624	1	Connected	Unknown	Online	27	2026-09-06 17:02:10.461958
4627	1	Connected	Unknown	Online	27	2026-09-06 17:03:10.526817
4629	1	Unknown	Unknown	Online	\N	2026-09-06 17:03:44.823588
4630	1	Unknown	Unknown	Online	\N	2026-09-06 17:03:44.830604
4733	1	Connected	Unknown	Online	24	2026-09-06 17:35:27.334288
4784	1	Connected	Unknown	Online	31	2026-09-06 17:50:09.267811
4785	1	Connected	Unknown	Online	31	2026-09-06 17:50:29.269455
4831	1	Connected	Unknown	Online	33	2026-09-06 18:05:30.879955
3195	1	Connected	Active	Online	94	2026-08-26 15:31:17.227887
3196	1	\N	\N	Online	\N	2026-08-26 15:31:45.221984
3306	1	\N	\N	Online	\N	2026-08-29 14:37:45.828868
3309	1	Connected	Active	Online	60	2026-08-29 14:38:25.692965
3310	1	Connected	Unknown	Online	59	2026-08-29 14:43:42.365959
3311	1	\N	\N	Online	\N	2026-08-29 14:43:42.384347
3408	1	Connected	Unknown	Online	54	2026-08-29 15:14:21.937351
3409	1	Connected	Unknown	Online	54	2026-08-29 15:14:41.934616
3410	1	Connected	Unknown	Online	54	2026-08-29 15:15:01.937662
3411	1	Connected	Unknown	Online	54	2026-08-29 15:15:21.947278
3414	1	Connected	Unknown	Online	54	2026-08-29 15:16:21.958667
3467	1	\N	\N	Online	\N	2026-08-29 15:38:26.424535
3550	1	Connected	Unknown	Online	43	2026-08-29 16:13:39.069493
3551	1	Connected	Unknown	Online	43	2026-08-29 16:13:59.060267
3552	1	Connected	Unknown	Online	43	2026-08-29 16:14:19.070282
3595	1	Connected	Unknown	Online	40	2026-08-29 16:29:08.752812
3599	1	Connected	Unknown	Online	40	2026-08-29 16:30:28.657694
3604	1	Connected	Unknown	Online	40	2026-08-29 16:32:08.675931
3648	1	Connected	Unknown	Online	35	2026-08-29 16:52:02.22059
3769	1	\N	\N	Online	\N	2026-08-30 12:55:27.606247
3858	1	Connected	Unknown	Online	8	2026-08-30 16:35:12.570545
3859	1	Connected	Unknown	Online	8	2026-08-30 16:35:32.606025
3862	1	Connected	Unknown	Online	9	2026-08-30 16:36:32.65314
3867	1	Connected	Unknown	Online	10	2026-08-30 16:38:12.716287
3871	1	Connected	Unknown	Online	11	2026-08-30 16:39:32.678477
3873	1	Connected	Unknown	Online	12	2026-08-30 16:40:12.829934
3875	1	Connected	Unknown	Online	12	2026-08-30 16:40:52.778097
3877	1	Connected	Unknown	Online	12	2026-08-30 16:41:32.809088
3878	1	Connected	Unknown	Online	12	2026-08-30 16:41:52.80019
3883	1	Connected	Unknown	Online	14	2026-08-30 16:43:32.88581
3885	1	Connected	Unknown	Online	14	2026-08-30 16:44:12.942544
3886	1	Connected	Unknown	Online	14	2026-08-30 16:44:32.924087
3887	1	Connected	Unknown	Online	14	2026-08-30 16:44:52.935095
3888	1	Connected	Unknown	Online	15	2026-08-30 16:45:12.913124
3889	1	Connected	Unknown	Online	15	2026-08-30 16:45:32.972683
3891	1	Connected	Unknown	Online	15	2026-08-30 16:46:13.051896
3894	1	Connected	Unknown	Online	16	2026-08-30 16:47:13.103635
3895	1	Connected	Unknown	Online	16	2026-08-30 16:47:33.026981
3896	1	Connected	Unknown	Online	17	2026-08-30 16:47:53.053895
3898	1	Connected	Unknown	Online	17	2026-08-30 16:48:33.05373
3899	1	Connected	Unknown	Online	17	2026-08-30 16:48:53.035369
3949	1	Connected	Unknown	Online	29	2026-08-30 17:06:04.337369
3953	1	Connected	Unknown	Online	30	2026-08-30 17:07:24.256185
4018	1	Connected	Unknown	Online	44	2026-09-06 13:38:32.508257
4062	1	Connected	Unknown	Online	41	2026-09-06 13:54:31.334073
4079	1	Connected	Unknown	Online	41	2026-09-06 13:59:21.687576
4088	1	Connected	Unknown	Online	39	2026-09-06 14:02:21.704514
4109	1	Connected	Unknown	Online	38	2026-09-06 14:09:21.942339
4114	1	Connected	Unknown	Online	38	2026-09-06 14:11:01.836861
4153	1	Connected	Unknown	Online	36	2026-09-06 14:23:07.530579
4241	1	Connected	Unknown	Online	30	2026-09-06 14:51:41.097614
4242	1	Connected	Unknown	Online	30	2026-09-06 14:52:01.333701
4248	1	Connected	Unknown	Online	30	2026-09-06 14:54:01.213141
4295	1	Connected	Unknown	Online	24	2026-09-06 15:14:01.462721
4296	1	Connected	Unknown	Online	24	2026-09-06 15:14:21.464797
4298	1	Connected	Unknown	Online	24	2026-09-06 15:15:01.453188
4367	1	Connected	Unknown	Online	20	2026-09-06 15:38:42.020181
4369	1	Connected	Unknown	Online	20	2026-09-06 15:39:21.83693
4371	1	Connected	Unknown	Online	20	2026-09-06 15:40:01.830652
4372	1	Connected	Unknown	Online	20	2026-09-06 15:40:21.890961
4375	1	Connected	Unknown	Online	20	2026-09-06 15:41:21.875848
4376	1	Connected	Unknown	Online	20	2026-09-06 15:41:41.908734
4380	1	Connected	Unknown	Online	19	2026-09-06 15:43:01.924097
4381	1	Connected	Unknown	Online	19	2026-09-06 15:43:23.319637
4586	1	Connected	Unknown	Online	29	2026-09-06 16:49:29.933459
4594	1	Connected	Unknown	Online	29	2026-09-06 16:52:10.33871
4597	1	Connected	Unknown	Online	29	2026-09-06 16:53:10.121065
4600	1	Connected	Unknown	Online	29	2026-09-06 16:54:10.329669
4609	1	Connected	Unknown	Online	28	2026-09-06 16:57:10.286733
4631	1	Unknown	Unknown	Online	\N	2026-09-06 17:03:44.886526
4734	1	Connected	Unknown	Online	24	2026-09-06 17:35:47.316093
4738	1	Connected	Unknown	Online	25	2026-09-06 17:37:07.451689
4742	1	Connected	Unknown	Online	26	2026-09-06 17:38:27.76487
4746	1	Connected	Unknown	Online	27	2026-09-06 17:39:47.481784
4750	1	Connected	Unknown	Online	27	2026-09-06 17:41:07.612642
4760	1	Connected	Unknown	Online	29	2026-09-06 17:44:27.757776
4787	1	Connected	Unknown	Online	31	2026-09-06 17:51:09.294677
4832	1	Connected	Unknown	Online	33	2026-09-06 18:05:50.881766
739	1	Connected	Unknown	Online	34	2026-08-07 23:24:40.981347
740	1	Disconnected	Unknown	Online	0	2026-08-07 23:24:40.981832
741	1	Connected	Unknown	Online	34	2026-08-07 23:24:40.982234
742	1	\N	\N	Online	\N	2026-08-07 23:25:09.418077
743	1	\N	\N	Online	\N	2026-08-07 23:25:09.418561
744	1	Connected	Unknown	Online	34	2026-08-07 23:25:09.895358
745	1	\N	\N	Online	\N	2026-08-07 23:25:12.93483
746	1	Connected	Unknown	Online	34	2026-08-07 23:26:18.187306
747	1	Connected	Unknown	Online	34	2026-08-07 23:26:18.189372
748	1	\N	\N	Online	\N	2026-08-07 23:26:19.440872
749	1	\N	\N	Online	\N	2026-08-07 23:26:19.580648
750	1	Connected	Active	Online	34	2026-08-07 23:26:36.757334
751	1	\N	\N	Online	\N	2026-08-07 23:26:40.152759
752	1	Connected	Active	Online	34	2026-08-07 23:26:56.7669
753	1	\N	\N	Online	\N	2026-08-07 23:27:00.180901
1242	1	Connected	Active	Online	19	2026-08-08 01:03:02.440299
1243	1	Connected	Active	Online	19	2026-08-08 01:03:22.492303
1244	1	Disconnected	Active	Online	0	2026-08-08 01:03:25.598853
3197	1	Connected	Active	Online	94	2026-08-26 15:45:51.900103
3307	1	Connected	Active	Online	60	2026-08-29 14:38:05.716517
3308	1	\N	\N	Online	\N	2026-08-29 14:38:15.775499
3413	1	Connected	Unknown	Online	54	2026-08-29 15:16:01.96846
3468	1	\N	\N	Online	\N	2026-08-29 15:38:26.427443
3553	1	Connected	Unknown	Online	43	2026-08-29 16:15:08.601239
3554	1	Connected	Unknown	Online	43	2026-08-29 16:15:28.472225
3598	1	Connected	Unknown	Online	40	2026-08-29 16:30:08.640992
3650	1	Connected	Unknown	Online	35	2026-08-29 16:52:42.228636
3651	1	Connected	Unknown	Online	35	2026-08-29 16:53:02.220084
3652	1	Connected	Unknown	Online	35	2026-08-29 16:53:22.236466
3653	1	Connected	Unknown	Online	35	2026-08-29 16:53:42.23132
3657	1	Connected	Unknown	Online	35	2026-08-29 16:55:02.23786
3659	1	Connected	Unknown	Online	35	2026-08-29 16:55:42.251176
3661	1	Connected	Unknown	Online	35	2026-08-29 16:56:22.258207
3663	1	Connected	Unknown	Online	34	2026-08-29 16:57:02.288305
3665	1	Connected	Unknown	Online	34	2026-08-29 16:57:42.295121
3667	1	Connected	Unknown	Online	34	2026-08-29 16:58:22.284816
3669	1	Connected	Unknown	Online	34	2026-08-29 16:59:02.280087
3678	1	Connected	Unknown	Online	33	2026-08-29 17:02:02.31893
3679	1	Connected	Unknown	Online	33	2026-08-29 17:02:22.328418
3770	1	Connected	Unknown	Online	80	2026-08-30 12:55:43.650593
3773	1	Connected	Unknown	Online	79	2026-08-30 12:56:43.682409
3777	1	Connected	Unknown	Online	79	2026-08-30 12:58:03.763691
3900	1	Connected	Unknown	Online	18	2026-08-30 16:49:13.090956
3951	1	Connected	Unknown	Online	30	2026-08-30 17:06:44.221126
3952	1	Connected	Unknown	Online	30	2026-08-30 17:07:04.215931
4019	1	Connected	Unknown	Online	44	2026-09-06 13:38:52.52016
4063	1	Connected	Unknown	Online	41	2026-09-06 13:54:51.236256
4110	1	Connected	Unknown	Online	38	2026-09-06 14:09:41.885314
4111	1	Connected	Unknown	Online	38	2026-09-06 14:10:01.830163
4115	1	Connected	Unknown	Online	38	2026-09-06 14:11:21.853372
4117	1	Connected	Unknown	Online	38	2026-09-06 14:12:01.868972
4120	1	Connected	Unknown	Online	38	2026-09-06 14:13:01.942387
4154	1	Connected	Unknown	Online	36	2026-09-06 14:23:27.558772
4155	1	Connected	Unknown	Online	36	2026-09-06 14:23:47.532666
4156	1	Connected	Unknown	Online	35	2026-09-06 14:24:07.486514
4157	1	Connected	Unknown	Online	35	2026-09-06 14:24:27.595315
4158	1	Connected	Unknown	Online	35	2026-09-06 14:24:47.561414
4159	1	Connected	Unknown	Online	35	2026-09-06 14:25:07.507357
4160	1	Connected	Unknown	Online	35	2026-09-06 14:25:27.582657
4170	1	Connected	Unknown	Online	35	2026-09-06 14:28:47.734409
4171	1	Connected	Unknown	Online	35	2026-09-06 14:29:07.62443
4174	1	Connected	Unknown	Online	35	2026-09-06 14:30:07.618118
4178	1	Connected	Unknown	Online	34	2026-09-06 14:31:27.613383
4179	1	Connected	Unknown	Online	34	2026-09-06 14:31:47.659082
4180	1	Connected	Unknown	Online	34	2026-09-06 14:32:07.736561
4182	1	Connected	Unknown	Online	34	2026-09-06 14:32:47.978994
4188	1	Connected	Unknown	Online	34	2026-09-06 14:34:47.753823
4191	1	Connected	Unknown	Online	34	2026-09-06 14:35:47.710359
4194	1	Connected	Unknown	Online	34	2026-09-06 14:36:47.714558
4195	1	Connected	Unknown	Online	33	2026-09-06 14:37:07.687976
4198	1	Connected	Unknown	Online	33	2026-09-06 14:38:07.754684
4201	1	Connected	Unknown	Online	33	2026-09-06 14:39:07.727278
4204	1	Connected	Unknown	Online	33	2026-09-06 14:40:07.77634
4207	1	Connected	Unknown	Online	33	2026-09-06 14:41:07.795231
4209	1	Connected	Unknown	Online	33	2026-09-06 14:41:47.794503
4244	1	Connected	Unknown	Online	30	2026-09-06 14:52:41.152993
4247	1	Connected	Unknown	Online	30	2026-09-06 14:53:41.1234
4250	1	Connected	Unknown	Online	30	2026-09-06 14:54:41.17087
4297	1	Connected	Unknown	Online	24	2026-09-06 15:14:41.524851
4299	1	Connected	Unknown	Online	24	2026-09-06 15:15:21.484309
4304	1	Connected	Unknown	Online	24	2026-09-06 15:17:01.478224
4307	1	Connected	Unknown	Online	24	2026-09-06 15:18:01.487772
4309	1	Unknown	Unknown	Online	\N	2026-09-06 15:18:28.72728
4368	1	Connected	Unknown	Online	20	2026-09-06 15:39:01.901089
4370	1	Connected	Unknown	Online	20	2026-09-06 15:39:41.807692
4373	1	Connected	Unknown	Online	20	2026-09-06 15:40:41.835499
4374	1	Connected	Unknown	Online	20	2026-09-06 15:41:01.849896
4377	1	Connected	Unknown	Online	19	2026-09-06 15:42:01.980608
4378	1	Connected	Unknown	Online	19	2026-09-06 15:42:21.945833
4379	1	Connected	Unknown	Online	19	2026-09-06 15:42:41.893683
4587	1	Connected	Unknown	Online	29	2026-09-06 16:49:50.232962
4590	1	Connected	Unknown	Online	29	2026-09-06 16:50:50.044691
4595	1	Connected	Unknown	Online	29	2026-09-06 16:52:30.094757
4596	1	Connected	Unknown	Online	29	2026-09-06 16:52:50.426136
4599	1	Connected	Unknown	Online	29	2026-09-06 16:53:50.234038
4601	1	Connected	Unknown	Online	29	2026-09-06 16:54:30.245785
4604	1	Connected	Unknown	Online	28	2026-09-06 16:55:30.198161
4605	1	Connected	Unknown	Online	28	2026-09-06 16:55:50.23115
4608	1	Connected	Unknown	Online	28	2026-09-06 16:56:50.518983
4632	1	Connected	Unknown	Online	27	2026-09-06 17:03:50.57915
4633	1	Connected	Unknown	Online	27	2026-09-06 17:04:10.565623
4635	1	Connected	Unknown	Online	27	2026-09-06 17:04:50.668327
4638	1	Connected	Unknown	Online	27	2026-09-06 17:05:50.662579
4639	1	Connected	Unknown	Online	26	2026-09-06 17:06:10.644599
4640	1	Connected	Unknown	Online	26	2026-09-06 17:06:30.623405
4641	1	Connected	Unknown	Online	26	2026-09-06 17:06:50.639832
4645	1	Connected	Unknown	Online	26	2026-09-06 17:08:10.708317
4646	1	Connected	Unknown	Online	26	2026-09-06 17:08:30.707274
4648	1	Connected	Unknown	Online	26	2026-09-06 17:09:10.769117
4650	1	Connected	Unknown	Online	26	2026-09-06 17:09:50.852834
4652	1	Connected	Unknown	Online	26	2026-09-06 17:10:30.906847
4653	1	Connected	Unknown	Online	26	2026-09-06 17:10:51.029857
4654	1	Connected	Unknown	Online	26	2026-09-06 17:11:10.831463
4658	1	Connected	Unknown	Online	26	2026-09-06 17:12:30.878351
4660	1	Connected	Unknown	Online	26	2026-09-06 17:13:11.015493
4662	1	Connected	Unknown	Online	25	2026-09-06 17:13:50.9514
4663	1	Connected	Unknown	Online	25	2026-09-06 17:14:11.027009
4735	1	Connected	Unknown	Online	25	2026-09-06 17:36:07.318852
4736	1	Connected	Unknown	Online	25	2026-09-06 17:36:27.418552
1914	1	Connected	Unknown	Online	41	2026-08-09 18:31:12.497172
1916	1	\N	\N	Online	\N	2026-08-09 18:31:14.391477
754	1	Connected	Active	Online	34	2026-08-07 23:27:16.802024
755	1	\N	\N	Online	\N	2026-08-07 23:27:20.175654
756	1	Connected	Active	Online	34	2026-08-07 23:27:36.950354
757	1	\N	\N	Online	\N	2026-08-07 23:27:47.463115
758	1	Connected	Active	Online	34	2026-08-07 23:27:56.893751
759	1	Connected	Active	Online	34	2026-08-07 23:28:17.031438
760	1	\N	\N	Online	\N	2026-08-07 23:28:17.508611
761	1	\N	\N	Online	\N	2026-08-07 23:28:17.691497
762	1	Connected	Active	Online	34	2026-08-07 23:28:37.169585
763	1	\N	\N	Online	\N	2026-08-07 23:28:47.528986
764	1	Connected	Active	Online	34	2026-08-07 23:28:56.86291
765	1	Connected	Active	Online	34	2026-08-07 23:29:16.905215
766	1	\N	\N	Online	\N	2026-08-07 23:29:17.638555
767	1	\N	\N	Online	\N	2026-08-07 23:29:17.68789
768	1	Connected	Active	Online	34	2026-08-07 23:29:36.955637
769	1	\N	\N	Online	\N	2026-08-07 23:29:47.661598
770	1	Connected	Active	Online	34	2026-08-07 23:29:56.924757
771	1	Connected	Active	Online	34	2026-08-07 23:30:16.953646
772	1	\N	\N	Online	\N	2026-08-07 23:30:17.710736
773	1	\N	\N	Online	\N	2026-08-07 23:30:17.787251
774	1	Connected	Active	Online	33	2026-08-07 23:30:36.989102
775	1	\N	\N	Online	\N	2026-08-07 23:30:47.882789
776	1	Connected	Active	Online	33	2026-08-07 23:30:57.027693
777	1	Connected	Active	Online	33	2026-08-07 23:31:17.018727
778	1	\N	\N	Online	\N	2026-08-07 23:31:17.836642
779	1	\N	\N	Online	\N	2026-08-07 23:31:17.955689
780	1	Connected	Active	Online	33	2026-08-07 23:31:37.110308
781	1	\N	\N	Online	\N	2026-08-07 23:31:47.881392
782	1	Connected	Active	Online	33	2026-08-07 23:31:57.036116
783	1	Connected	Active	Online	33	2026-08-07 23:32:17.491416
784	1	\N	\N	Online	\N	2026-08-07 23:32:17.957214
785	1	\N	\N	Online	\N	2026-08-07 23:32:18.036845
786	1	Connected	Active	Online	33	2026-08-07 23:32:37.051255
787	1	\N	\N	Online	\N	2026-08-07 23:32:48.461952
788	1	Connected	Active	Online	33	2026-08-07 23:32:57.066345
789	1	Connected	Active	Online	33	2026-08-07 23:33:17.192427
790	1	\N	\N	Online	\N	2026-08-07 23:33:18.155694
791	1	\N	\N	Online	\N	2026-08-07 23:33:18.208093
792	1	Connected	Active	Online	33	2026-08-07 23:33:37.151209
793	1	\N	\N	Online	\N	2026-08-07 23:33:48.281687
794	1	Connected	Active	Online	33	2026-08-07 23:33:57.126254
795	1	Connected	Active	Online	33	2026-08-07 23:34:17.278368
796	1	\N	\N	Online	\N	2026-08-07 23:34:18.294232
797	1	\N	\N	Online	\N	2026-08-07 23:34:18.359731
798	1	Connected	Active	Online	33	2026-08-07 23:34:37.712159
799	1	\N	\N	Online	\N	2026-08-07 23:34:48.287674
800	1	Connected	Active	Online	33	2026-08-07 23:34:57.186365
801	1	Connected	Active	Online	33	2026-08-07 23:35:17.277191
802	1	\N	\N	Online	\N	2026-08-07 23:35:18.311927
803	1	\N	\N	Online	\N	2026-08-07 23:35:18.367246
804	1	Connected	Active	Online	33	2026-08-07 23:35:37.866683
805	1	\N	\N	Online	\N	2026-08-07 23:35:48.336561
806	1	Connected	Active	Online	33	2026-08-07 23:35:57.251386
807	1	Connected	Active	Online	33	2026-08-07 23:36:17.281321
808	1	\N	\N	Online	\N	2026-08-07 23:36:18.332693
809	1	\N	\N	Online	\N	2026-08-07 23:36:18.37295
810	1	Connected	Active	Online	33	2026-08-07 23:36:37.285434
811	1	\N	\N	Online	\N	2026-08-07 23:36:48.415751
812	1	Connected	Active	Online	32	2026-08-07 23:36:57.275884
813	1	Connected	Active	Online	32	2026-08-07 23:37:17.292809
814	1	\N	\N	Online	\N	2026-08-07 23:37:18.506223
815	1	\N	\N	Online	\N	2026-08-07 23:37:18.731432
816	1	Connected	Active	Online	32	2026-08-07 23:37:37.385748
817	1	\N	\N	Online	\N	2026-08-07 23:37:48.533115
818	1	Connected	Active	Online	32	2026-08-07 23:37:57.478453
819	1	Connected	Active	Online	32	2026-08-07 23:38:17.64649
820	1	\N	\N	Online	\N	2026-08-07 23:38:18.534004
821	1	\N	\N	Online	\N	2026-08-07 23:38:18.82155
822	1	Connected	Active	Online	32	2026-08-07 23:38:37.384141
823	1	\N	\N	Online	\N	2026-08-07 23:38:48.723237
824	1	Connected	Active	Online	32	2026-08-07 23:38:57.422436
825	1	Connected	Active	Online	32	2026-08-07 23:39:17.431644
826	1	\N	\N	Online	\N	2026-08-07 23:39:18.74976
827	1	\N	\N	Online	\N	2026-08-07 23:39:18.971665
828	1	Connected	Active	Online	32	2026-08-07 23:39:37.569297
829	1	\N	\N	Online	\N	2026-08-07 23:39:48.702807
830	1	Connected	Active	Online	32	2026-08-07 23:39:57.428375
831	1	Connected	Active	Online	32	2026-08-07 23:40:17.43667
832	1	\N	\N	Online	\N	2026-08-07 23:40:18.801222
833	1	\N	\N	Online	\N	2026-08-07 23:40:18.908754
834	1	Connected	Active	Online	32	2026-08-07 23:40:37.487743
835	1	\N	\N	Online	\N	2026-08-07 23:40:48.866765
836	1	Connected	Active	Online	32	2026-08-07 23:40:57.460607
837	1	Connected	Active	Online	32	2026-08-07 23:41:17.489534
838	1	\N	\N	Online	\N	2026-08-07 23:41:18.901368
839	1	\N	\N	Online	\N	2026-08-07 23:41:19.008467
840	1	Connected	Active	Online	32	2026-08-07 23:41:37.838546
841	1	\N	\N	Online	\N	2026-08-07 23:41:48.920828
842	1	Connected	Active	Online	32	2026-08-07 23:41:57.528714
843	1	Connected	Active	Online	32	2026-08-07 23:42:17.546031
844	1	\N	\N	Online	\N	2026-08-07 23:42:19.349337
845	1	\N	\N	Online	\N	2026-08-07 23:42:19.357072
846	1	Connected	Active	Online	32	2026-08-07 23:42:37.556489
847	1	\N	\N	Online	\N	2026-08-07 23:42:48.980792
848	1	Connected	Active	Online	32	2026-08-07 23:42:57.63736
849	1	Connected	Active	Online	32	2026-08-07 23:43:17.663601
850	1	\N	\N	Online	\N	2026-08-07 23:43:19.036335
851	1	\N	\N	Online	\N	2026-08-07 23:43:19.149993
852	1	Connected	Active	Online	31	2026-08-07 23:43:37.813334
853	1	\N	\N	Online	\N	2026-08-07 23:43:49.236232
854	1	Connected	Active	Online	31	2026-08-07 23:43:57.664595
855	1	Connected	Active	Online	31	2026-08-07 23:44:17.631324
856	1	\N	\N	Online	\N	2026-08-07 23:44:19.086106
857	1	\N	\N	Online	\N	2026-08-07 23:44:19.139517
858	1	Connected	Active	Online	31	2026-08-07 23:44:37.68995
859	1	\N	\N	Online	\N	2026-08-07 23:44:49.093894
860	1	Connected	Active	Online	31	2026-08-07 23:44:57.677775
861	1	Connected	Active	Online	31	2026-08-07 23:45:17.717783
862	1	\N	\N	Online	\N	2026-08-07 23:45:19.198077
863	1	\N	\N	Online	\N	2026-08-07 23:45:19.228842
864	1	Connected	Active	Online	31	2026-08-07 23:45:37.69729
865	1	\N	\N	Online	\N	2026-08-07 23:45:49.232143
866	1	Connected	Active	Online	31	2026-08-07 23:45:57.722656
867	1	Connected	Active	Online	31	2026-08-07 23:46:17.736881
868	1	\N	\N	Online	\N	2026-08-07 23:46:19.436787
869	1	\N	\N	Online	\N	2026-08-07 23:46:19.439605
870	1	Connected	Active	Online	31	2026-08-07 23:46:37.787497
871	1	\N	\N	Online	\N	2026-08-07 23:46:49.368552
872	1	Connected	Active	Online	31	2026-08-07 23:46:57.942917
873	1	Connected	Active	Online	31	2026-08-07 23:47:17.876493
874	1	\N	\N	Online	\N	2026-08-07 23:47:19.456758
875	1	\N	\N	Online	\N	2026-08-07 23:47:19.506865
876	1	Connected	Active	Online	31	2026-08-07 23:47:37.785904
877	1	\N	\N	Online	\N	2026-08-07 23:47:49.530361
878	1	Connected	Active	Online	31	2026-08-07 23:47:57.809393
879	1	Connected	Active	Online	31	2026-08-07 23:48:17.848812
880	1	\N	\N	Online	\N	2026-08-07 23:48:19.568799
881	1	\N	\N	Online	\N	2026-08-07 23:48:19.684745
882	1	Connected	Active	Online	31	2026-08-07 23:48:37.823834
883	1	\N	\N	Online	\N	2026-08-07 23:48:49.574548
885	1	Connected	Active	Online	31	2026-08-07 23:49:17.844417
886	1	\N	\N	Online	\N	2026-08-07 23:49:19.669397
888	1	Connected	Active	Online	31	2026-08-07 23:49:37.888577
890	1	Connected	Active	Online	30	2026-08-07 23:49:57.936908
893	1	\N	\N	Online	\N	2026-08-07 23:50:20.245711
894	1	Connected	Active	Online	30	2026-08-07 23:50:38.008237
895	1	\N	\N	Online	\N	2026-08-07 23:50:49.802107
896	1	Connected	Active	Online	30	2026-08-07 23:50:57.967294
905	1	\N	\N	Online	\N	2026-08-07 23:52:20.134124
908	1	Connected	Active	Online	30	2026-08-07 23:52:58.068242
909	1	Connected	Active	Online	30	2026-08-07 23:53:18.147801
910	1	\N	\N	Online	\N	2026-08-07 23:53:20.179775
3198	1	\N	\N	Online	\N	2026-08-26 15:45:52.001737
3312	1	\N	\N	Online	\N	2026-08-29 14:43:42.571722
3313	1	\N	\N	Online	\N	2026-08-29 14:43:46.569394
3415	1	Connected	Unknown	Online	54	2026-08-29 15:16:41.970188
3420	1	Connected	Unknown	Online	54	2026-08-29 15:18:21.997719
3469	1	Connected	Unknown	Online	49	2026-08-29 15:42:33.838828
3475	1	Connected	Unknown	Online	49	2026-08-29 15:44:18.479209
3476	1	Connected	Unknown	Online	49	2026-08-29 15:44:38.455864
3479	1	Connected	Unknown	Online	48	2026-08-29 15:45:38.46003
3480	1	Connected	Unknown	Online	48	2026-08-29 15:45:58.477994
3555	1	Connected	Unknown	Online	42	2026-08-29 16:15:48.484578
3603	1	Connected	Unknown	Online	40	2026-08-29 16:31:48.65017
3654	1	Connected	Unknown	Online	35	2026-08-29 16:54:02.239257
3775	1	Connected	Unknown	Online	79	2026-08-30 12:57:23.679875
3782	1	Connected	Unknown	Online	79	2026-08-30 12:59:43.660419
3788	1	Connected	Unknown	Online	79	2026-08-30 13:01:43.709957
3793	1	Connected	Unknown	Online	79	2026-08-30 13:03:23.794224
3801	1	Connected	Unknown	Online	78	2026-08-30 13:06:03.769408
3806	1	Connected	Unknown	Online	78	2026-08-30 13:07:43.7751
3807	1	Connected	Unknown	Online	78	2026-08-30 13:08:03.806809
3815	1	Connected	Unknown	Online	78	2026-08-30 13:10:43.832052
3901	1	Connected	Unknown	Online	18	2026-08-30 16:49:33.131444
3902	1	Connected	Unknown	Online	18	2026-08-30 16:49:53.13496
3954	1	Connected	Unknown	Online	30	2026-08-30 17:07:44.267282
4020	1	Connected	Unknown	Online	43	2026-09-06 13:39:12.61586
4021	1	Connected	Unknown	Online	43	2026-09-06 13:39:32.609316
4064	1	Connected	Unknown	Online	41	2026-09-06 13:55:22.202364
4065	1	Unknown	Unknown	Online	\N	2026-09-06 13:55:24.524357
4069	1	Connected	Unknown	Online	41	2026-09-06 13:56:01.613263
4112	1	Connected	Unknown	Online	38	2026-09-06 14:10:21.853017
4113	1	Connected	Unknown	Online	38	2026-09-06 14:10:41.865725
4119	1	Connected	Unknown	Online	38	2026-09-06 14:12:41.863534
4161	1	Connected	Unknown	Online	35	2026-09-06 14:25:47.761722
4162	1	Connected	Unknown	Online	35	2026-09-06 14:26:07.682186
4163	1	Connected	Unknown	Online	35	2026-09-06 14:26:27.64099
4164	1	Connected	Unknown	Online	35	2026-09-06 14:26:47.577724
4165	1	Connected	Unknown	Online	35	2026-09-06 14:27:07.61181
4166	1	Connected	Unknown	Online	35	2026-09-06 14:27:27.537458
4167	1	Connected	Unknown	Online	35	2026-09-06 14:27:47.717111
4168	1	Connected	Unknown	Online	35	2026-09-06 14:28:07.584246
4169	1	Connected	Unknown	Online	35	2026-09-06 14:28:27.639996
4172	1	Connected	Unknown	Online	35	2026-09-06 14:29:27.615022
4173	1	Connected	Unknown	Online	35	2026-09-06 14:29:47.604465
4175	1	Connected	Unknown	Online	35	2026-09-06 14:30:27.607031
4176	1	Connected	Unknown	Online	35	2026-09-06 14:30:47.641944
4177	1	Connected	Unknown	Online	34	2026-09-06 14:31:07.603624
4181	1	Connected	Unknown	Online	34	2026-09-06 14:32:27.768383
4186	1	Connected	Unknown	Online	34	2026-09-06 14:34:07.79072
4187	1	Connected	Unknown	Online	34	2026-09-06 14:34:27.676353
4245	1	Connected	Unknown	Online	30	2026-09-06 14:53:01.163988
4251	1	Connected	Unknown	Online	30	2026-09-06 14:55:01.156709
4300	1	Connected	Unknown	Online	24	2026-09-06 15:15:41.509203
4382	1	Connected	Unknown	Online	19	2026-09-06 15:44:12.507903
4384	1	Connected	Unknown	Online	19	2026-09-06 15:44:42.066245
4391	1	Connected	Unknown	Online	19	2026-09-06 15:47:02.170417
4392	1	Connected	Unknown	Online	19	2026-09-06 15:47:22.09621
4394	1	Connected	Unknown	Online	19	2026-09-06 15:48:02.106585
4396	1	Connected	Unknown	Online	18	2026-09-06 15:48:42.121225
4397	1	Connected	Unknown	Online	18	2026-09-06 15:49:02.080897
4401	1	Connected	Unknown	Online	18	2026-09-06 15:50:22.17437
4402	1	Connected	Unknown	Online	18	2026-09-06 15:50:42.311108
4404	1	Connected	Unknown	Online	18	2026-09-06 15:51:30.992612
4405	1	Unknown	Unknown	Online	\N	2026-09-06 15:51:33.411446
4407	1	Unknown	Unknown	Online	\N	2026-09-06 15:51:33.961926
4634	1	Connected	Unknown	Online	27	2026-09-06 17:04:30.68696
4636	1	Connected	Unknown	Online	27	2026-09-06 17:05:10.619439
4637	1	Connected	Unknown	Online	27	2026-09-06 17:05:30.593585
4642	1	Connected	Unknown	Online	26	2026-09-06 17:07:10.622658
4643	1	Connected	Unknown	Online	26	2026-09-06 17:07:30.695202
4644	1	Connected	Unknown	Online	26	2026-09-06 17:07:50.764484
4647	1	Connected	Unknown	Online	26	2026-09-06 17:08:50.775237
4649	1	Connected	Unknown	Online	26	2026-09-06 17:09:30.737537
4651	1	Connected	Unknown	Online	26	2026-09-06 17:10:10.81555
4655	1	Connected	Unknown	Online	26	2026-09-06 17:11:30.834475
4656	1	Connected	Unknown	Online	26	2026-09-06 17:11:50.861622
4657	1	Connected	Unknown	Online	26	2026-09-06 17:12:10.8749
4659	1	Connected	Unknown	Online	26	2026-09-06 17:12:51.016428
4661	1	Connected	Unknown	Online	26	2026-09-06 17:13:30.923104
4737	1	Connected	Unknown	Online	25	2026-09-06 17:36:47.378406
4740	1	Connected	Unknown	Online	26	2026-09-06 17:37:47.428952
4788	1	Connected	Unknown	Online	31	2026-09-06 17:51:29.312467
4789	1	Connected	Unknown	Online	31	2026-09-06 17:51:49.325594
4790	1	Connected	Unknown	Online	31	2026-09-06 17:52:09.554576
4791	1	Connected	Unknown	Online	32	2026-09-06 17:52:29.389712
4792	1	Connected	Unknown	Online	32	2026-09-06 17:52:49.419471
4833	1	Connected	Unknown	Online	33	2026-09-06 18:06:10.973897
4834	1	Connected	Unknown	Online	33	2026-09-06 18:06:30.91746
1911	1	\N	\N	Online	\N	2026-08-09 18:31:12.493568
1913	1	\N	\N	Online	\N	2026-08-09 18:31:12.495363
1915	1	\N	\N	Online	\N	2026-08-09 18:31:14.38483
1920	1	Connected	Active	Online	40	2026-08-09 18:31:51.242943
1921	1	\N	\N	Online	\N	2026-08-09 18:32:11.324371
1924	1	\N	\N	Online	\N	2026-08-09 18:32:19.075978
1929	1	\N	\N	Online	\N	2026-08-09 18:32:59.242107
1930	1	Connected	Unknown	Online	39	2026-08-09 18:32:59.360817
1932	1	Connected	Unknown	Online	39	2026-08-09 18:32:59.392425
1933	1	\N	\N	Online	\N	2026-08-09 18:32:59.654974
1941	1	\N	\N	Online	\N	2026-08-09 18:34:00.460502
884	1	Connected	Active	Online	31	2026-08-07 23:48:57.921055
887	1	\N	\N	Online	\N	2026-08-07 23:49:19.720534
889	1	\N	\N	Online	\N	2026-08-07 23:49:49.705465
891	1	Connected	Active	Online	30	2026-08-07 23:50:17.943462
892	1	\N	\N	Online	\N	2026-08-07 23:50:19.818452
897	1	Connected	Active	Online	30	2026-08-07 23:51:17.998807
898	1	\N	\N	Online	\N	2026-08-07 23:51:19.922104
899	1	\N	\N	Online	\N	2026-08-07 23:51:20.039554
900	1	Connected	Active	Online	30	2026-08-07 23:51:37.978328
901	1	\N	\N	Online	\N	2026-08-07 23:51:50.265184
902	1	Connected	Active	Online	30	2026-08-07 23:51:58.135752
903	1	Connected	Active	Online	30	2026-08-07 23:52:18.048907
904	1	\N	\N	Online	\N	2026-08-07 23:52:20.041602
906	1	Connected	Active	Online	30	2026-08-07 23:52:38.227994
907	1	\N	\N	Online	\N	2026-08-07 23:52:50.06785
911	1	\N	\N	Online	\N	2026-08-07 23:53:20.343516
912	1	Connected	Active	Online	30	2026-08-07 23:53:38.102378
913	1	\N	\N	Online	\N	2026-08-07 23:53:50.277046
914	1	Connected	Active	Online	30	2026-08-07 23:53:58.171299
915	1	Connected	Active	Online	30	2026-08-07 23:54:18.20231
916	1	\N	\N	Online	\N	2026-08-07 23:54:20.281233
917	1	\N	\N	Online	\N	2026-08-07 23:54:20.341409
918	1	Connected	Active	Online	30	2026-08-07 23:54:38.186236
919	1	\N	\N	Online	\N	2026-08-07 23:54:50.317612
920	1	Connected	Active	Online	30	2026-08-07 23:54:58.177653
921	1	Connected	Active	Online	30	2026-08-07 23:55:18.194098
922	1	\N	\N	Online	\N	2026-08-07 23:55:20.556832
923	1	\N	\N	Online	\N	2026-08-07 23:55:20.679098
924	1	Connected	Unknown	Online	29	2026-08-07 23:58:54.470663
925	1	Connected	Unknown	Online	29	2026-08-07 23:58:54.510293
926	1	\N	\N	Online	\N	2026-08-07 23:59:09.403245
927	1	\N	\N	Online	\N	2026-08-07 23:59:09.556037
928	1	Connected	Active	Online	29	2026-08-07 23:59:14.390424
929	1	Connected	Active	Online	29	2026-08-07 23:59:34.45213
930	1	\N	\N	Online	\N	2026-08-07 23:59:39.472244
931	1	\N	\N	Online	\N	2026-08-07 23:59:39.594996
932	1	Connected	Active	Online	29	2026-08-07 23:59:54.486096
933	1	\N	\N	Online	\N	2026-08-08 00:00:09.633693
934	1	Connected	Active	Online	29	2026-08-08 00:00:14.486343
935	1	\N	\N	Online	\N	2026-08-08 00:00:14.552524
936	1	Connected	Active	Online	29	2026-08-08 00:00:34.508787
937	1	\N	\N	Online	\N	2026-08-08 00:00:39.63696
938	1	Connected	Active	Online	29	2026-08-08 00:00:54.566792
939	1	\N	\N	Online	\N	2026-08-08 00:01:09.63788
940	1	Connected	Active	Online	29	2026-08-08 00:01:14.504487
941	1	\N	\N	Online	\N	2026-08-08 00:01:14.568822
942	1	Connected	Active	Online	29	2026-08-08 00:01:34.521932
943	1	Connected	Unknown	Online	28	2026-08-08 00:03:01.058194
945	1	\N	\N	Online	\N	2026-08-08 00:03:01.141927
944	1	\N	\N	Online	\N	2026-08-08 00:03:01.14126
946	1	Connected	Unknown	Online	28	2026-08-08 00:03:01.222582
947	1	Connected	Active	Online	28	2026-08-08 00:03:19.921071
948	1	\N	\N	Online	\N	2026-08-08 00:03:29.988873
949	1	Connected	Active	Online	28	2026-08-08 00:03:39.977355
950	1	Connected	Active	Online	28	2026-08-08 00:03:59.962473
951	1	\N	\N	Online	\N	2026-08-08 00:04:00.060628
952	1	\N	\N	Online	\N	2026-08-08 00:04:00.093548
953	1	Connected	Active	Online	28	2026-08-08 00:04:19.972533
954	1	\N	\N	Online	\N	2026-08-08 00:04:30.19856
955	1	Connected	Active	Online	28	2026-08-08 00:04:39.995313
956	1	Connected	Active	Online	28	2026-08-08 00:05:00.010041
957	1	\N	\N	Online	\N	2026-08-08 00:05:00.243966
958	1	\N	\N	Online	\N	2026-08-08 00:05:00.368661
959	1	Connected	Active	Online	28	2026-08-08 00:05:20.005192
960	1	\N	\N	Online	\N	2026-08-08 00:05:30.28372
961	1	Connected	Active	Online	28	2026-08-08 00:05:40.031459
962	1	Connected	Active	Online	28	2026-08-08 00:06:00.044119
963	1	\N	\N	Online	\N	2026-08-08 00:06:00.384885
964	1	\N	\N	Online	\N	2026-08-08 00:06:00.468313
965	1	Connected	Active	Online	28	2026-08-08 00:06:20.075841
966	1	\N	\N	Online	\N	2026-08-08 00:06:30.453077
967	1	Connected	Active	Online	27	2026-08-08 00:06:40.084972
968	1	Connected	Active	Online	27	2026-08-08 00:07:00.10875
969	1	\N	\N	Online	\N	2026-08-08 00:07:00.603159
970	1	\N	\N	Online	\N	2026-08-08 00:07:00.648788
971	1	Connected	Active	Online	27	2026-08-08 00:07:20.121974
972	1	\N	\N	Online	\N	2026-08-08 00:07:30.643879
973	1	Connected	Active	Online	27	2026-08-08 00:07:40.134505
974	1	Connected	Active	Online	27	2026-08-08 00:08:00.151231
975	1	\N	\N	Online	\N	2026-08-08 00:08:00.723454
976	1	\N	\N	Online	\N	2026-08-08 00:08:00.786456
977	1	Connected	Active	Online	27	2026-08-08 00:08:20.177413
978	1	\N	\N	Online	\N	2026-08-08 00:08:30.751214
979	1	Connected	Active	Online	27	2026-08-08 00:08:40.188857
980	1	Connected	Active	Online	27	2026-08-08 00:09:00.257805
981	1	\N	\N	Online	\N	2026-08-08 00:09:00.780114
982	1	\N	\N	Online	\N	2026-08-08 00:09:01.003606
983	1	Connected	Active	Online	27	2026-08-08 00:09:20.203059
984	1	\N	\N	Online	\N	2026-08-08 00:09:30.817545
985	1	Connected	Active	Online	27	2026-08-08 00:09:40.253376
986	1	Connected	Active	Online	27	2026-08-08 00:10:00.267656
987	1	\N	\N	Online	\N	2026-08-08 00:10:00.834021
988	1	\N	\N	Online	\N	2026-08-08 00:10:00.940382
989	1	Connected	Active	Online	27	2026-08-08 00:10:20.303707
990	1	\N	\N	Online	\N	2026-08-08 00:10:30.880871
991	1	Connected	Active	Online	27	2026-08-08 00:10:40.266802
992	1	Connected	Active	Online	27	2026-08-08 00:11:00.308743
993	1	\N	\N	Online	\N	2026-08-08 00:11:00.938885
994	1	\N	\N	Online	\N	2026-08-08 00:11:01.070817
995	1	Connected	Active	Online	27	2026-08-08 00:11:20.353576
996	1	\N	\N	Online	\N	2026-08-08 00:11:31.086366
997	1	Connected	Active	Online	27	2026-08-08 00:11:40.333624
998	1	Connected	Active	Online	27	2026-08-08 00:12:00.347724
999	1	\N	\N	Online	\N	2026-08-08 00:12:01.045638
1000	1	\N	\N	Online	\N	2026-08-08 00:12:01.195555
1001	1	Connected	Active	Online	27	2026-08-08 00:12:20.35641
1002	1	\N	\N	Online	\N	2026-08-08 00:12:31.148197
1003	1	Connected	Active	Online	26	2026-08-08 00:12:40.394384
1004	1	Connected	Active	Online	26	2026-08-08 00:13:00.506821
1005	1	\N	\N	Online	\N	2026-08-08 00:13:01.197872
1006	1	\N	\N	Online	\N	2026-08-08 00:13:01.25107
1007	1	Connected	Active	Online	26	2026-08-08 00:13:20.419124
1008	1	\N	\N	Online	\N	2026-08-08 00:13:31.09789
1009	1	Connected	Active	Online	26	2026-08-08 00:13:40.427475
1010	1	Connected	Active	Online	26	2026-08-08 00:14:00.457419
1011	1	\N	\N	Online	\N	2026-08-08 00:14:01.246135
1012	1	\N	\N	Online	\N	2026-08-08 00:14:01.323272
1013	1	Connected	Active	Online	26	2026-08-08 00:14:20.494311
1014	1	\N	\N	Online	\N	2026-08-08 00:14:31.301147
1015	1	Connected	Active	Online	26	2026-08-08 00:14:40.460754
1016	1	Connected	Active	Online	26	2026-08-08 00:15:00.497093
1017	1	\N	\N	Online	\N	2026-08-08 00:15:01.324428
1018	1	\N	\N	Online	\N	2026-08-08 00:15:01.43926
1019	1	Connected	Active	Online	26	2026-08-08 00:15:20.530993
1020	1	\N	\N	Online	\N	2026-08-08 00:15:31.466833
1021	1	Connected	Active	Online	26	2026-08-08 00:15:40.537383
1022	1	Connected	Active	Online	26	2026-08-08 00:16:00.60365
1023	1	\N	\N	Online	\N	2026-08-08 00:16:01.343043
1024	1	\N	\N	Online	\N	2026-08-08 00:16:01.422296
3199	1	Connected	Unknown	Online	87	2026-08-26 17:48:55.898276
3200	1	Connected	Unknown	Online	87	2026-08-26 17:57:30.276641
3201	1	Connected	Unknown	Online	78	2026-08-26 17:57:35.097349
3202	1	Connected	Unknown	Online	78	2026-08-26 17:57:55.210451
3203	1	Connected	Unknown	Online	78	2026-08-26 17:58:15.216756
3204	1	Connected	Unknown	Online	78	2026-08-26 17:58:35.218747
3205	1	Connected	Unknown	Online	78	2026-08-26 17:58:55.223169
3206	1	Connected	Unknown	Online	78	2026-08-26 17:59:15.22278
3207	1	Connected	Unknown	Online	78	2026-08-26 18:00:16.203961
3208	1	Connected	Unknown	Online	78	2026-08-26 18:00:35.360121
3209	1	Connected	Unknown	Online	75	2026-08-26 18:00:42.968781
3210	1	\N	\N	Online	\N	2026-08-26 18:00:46.456479
3314	1	Connected	Unknown	Online	59	2026-08-29 14:44:02.363831
3419	1	Connected	Unknown	Online	54	2026-08-29 15:18:01.975016
3421	1	Connected	Unknown	Online	54	2026-08-29 15:18:41.979928
3422	1	Connected	Unknown	Online	53	2026-08-29 15:19:01.992272
3432	1	Connected	Unknown	Online	53	2026-08-29 15:22:22.023273
3433	1	Connected	Unknown	Online	53	2026-08-29 15:22:42.031718
3434	1	Connected	Unknown	Online	53	2026-08-29 15:23:01.972488
3436	1	\N	\N	Online	\N	2026-08-29 15:23:02.741466
3470	1	Connected	Unknown	Online	49	2026-08-29 15:42:38.43918
3471	1	Connected	Unknown	Online	49	2026-08-29 15:42:58.429746
3556	1	Connected	Unknown	Online	42	2026-08-29 16:16:08.508516
3557	1	Connected	Unknown	Online	42	2026-08-29 16:16:28.457569
3559	1	Connected	Unknown	Online	42	2026-08-29 16:17:08.483223
3605	1	Connected	Unknown	Online	39	2026-08-29 16:32:53.098628
3606	1	Connected	Unknown	Online	39	2026-08-29 16:33:12.734316
3655	1	Connected	Unknown	Online	35	2026-08-29 16:54:22.315776
3778	1	Connected	Unknown	Online	79	2026-08-30 12:58:23.674599
3781	1	Connected	Unknown	Online	79	2026-08-30 12:59:23.675072
3784	1	Connected	Unknown	Online	79	2026-08-30 13:00:23.729807
3903	1	Connected	Unknown	Online	18	2026-08-30 16:50:13.163209
3904	1	Connected	Unknown	Online	18	2026-08-30 16:50:33.131365
3955	1	Connected	Unknown	Online	30	2026-08-30 17:08:04.257704
4022	1	Connected	Unknown	Online	43	2026-09-06 13:41:15.758387
4031	1	Unknown	Unknown	Online	\N	2026-09-06 13:43:09.595566
4066	1	Unknown	Unknown	Online	\N	2026-09-06 13:55:24.861477
4067	1	Unknown	Unknown	Online	\N	2026-09-06 13:55:24.891946
4116	1	Connected	Unknown	Online	38	2026-09-06 14:11:41.871027
4118	1	Connected	Unknown	Online	38	2026-09-06 14:12:21.875745
4121	1	Connected	Unknown	Online	38	2026-09-06 14:13:21.90449
4183	1	Connected	Unknown	Online	34	2026-09-06 14:33:07.675246
4184	1	Connected	Unknown	Online	34	2026-09-06 14:33:27.682617
4246	1	Connected	Unknown	Online	30	2026-09-06 14:53:21.144517
4303	1	Connected	Unknown	Online	24	2026-09-06 15:16:41.54685
4305	1	Connected	Unknown	Online	24	2026-09-06 15:17:21.501216
4383	1	Connected	Unknown	Online	19	2026-09-06 15:44:22.015892
4385	1	Connected	Unknown	Online	19	2026-09-06 15:45:02.001894
4386	1	Connected	Unknown	Online	19	2026-09-06 15:45:22.023118
4387	1	Connected	Unknown	Online	19	2026-09-06 15:45:42.006085
4388	1	Connected	Unknown	Online	19	2026-09-06 15:46:02.086102
4389	1	Connected	Unknown	Online	19	2026-09-06 15:46:22.121554
4390	1	Connected	Unknown	Online	19	2026-09-06 15:46:42.046302
4393	1	Connected	Unknown	Online	19	2026-09-06 15:47:42.083508
4395	1	Connected	Unknown	Online	18	2026-09-06 15:48:22.107933
4664	1	Connected	Unknown	Online	25	2026-09-06 17:14:30.964898
4665	1	Connected	Unknown	Online	25	2026-09-06 17:14:50.999496
4672	1	Connected	Unknown	Online	25	2026-09-06 17:17:11.08779
4741	1	Connected	Unknown	Online	26	2026-09-06 17:38:07.398047
4793	1	Connected	Unknown	Online	32	2026-09-06 17:53:09.37503
4837	1	Connected	Unknown	Online	33	2026-09-06 18:07:30.995839
1912	1	Connected	Unknown	Online	41	2026-08-09 18:31:12.499219
1917	1	Connected	Active	Online	40	2026-08-09 18:31:31.407546
1918	1	\N	\N	Online	\N	2026-08-09 18:31:46.668138
1919	1	\N	\N	Online	\N	2026-08-09 18:31:46.706741
1922	1	Connected	Active	Online	40	2026-08-09 18:32:11.342064
1923	1	\N	\N	Online	\N	2026-08-09 18:32:19.072592
1925	1	Connected	Active	Online	39	2026-08-09 18:32:31.33918
1926	1	Connected	Active	Online	39	2026-08-09 18:32:51.434654
1927	1	\N	\N	Online	\N	2026-08-09 18:32:51.445078
1928	1	\N	\N	Online	\N	2026-08-09 18:32:51.459327
1931	1	\N	\N	Online	\N	2026-08-09 18:32:59.382822
1934	1	\N	\N	Online	\N	2026-08-09 18:32:59.655597
1935	1	Connected	Active	Online	39	2026-08-09 18:33:19.478179
1936	1	\N	\N	Online	\N	2026-08-09 18:33:23.716052
1937	1	\N	\N	Online	\N	2026-08-09 18:33:23.843837
1938	1	Connected	Active	Online	38	2026-08-09 18:33:39.822788
1939	1	Disconnected	Active	Online	0	2026-08-09 18:33:52.962081
1940	1	Connected	Active	Online	38	2026-08-09 18:34:00.304634
1942	1	Connected	Active	Online	38	2026-08-09 18:34:20.564896
1943	1	Connected	Active	Online	37	2026-08-09 18:34:39.49587
1944	1	\N	\N	Online	\N	2026-08-09 18:34:40.056555
1945	1	\N	\N	Online	\N	2026-08-09 18:34:40.194395
1946	1	Disconnected	Active	Online	0	2026-08-09 18:34:43.197614
1025	1	Connected	Active	Online	26	2026-08-08 00:16:20.565074
1026	1	\N	\N	Online	\N	2026-08-08 00:16:31.453311
1027	1	Connected	Active	Online	26	2026-08-08 00:16:40.576913
1028	1	Connected	Active	Online	26	2026-08-08 00:17:00.580836
1029	1	\N	\N	Online	\N	2026-08-08 00:17:01.49504
1030	1	\N	\N	Online	\N	2026-08-08 00:17:01.603775
1031	1	Connected	Active	Online	26	2026-08-08 00:17:20.631262
1032	1	\N	\N	Online	\N	2026-08-08 00:17:31.531026
1033	1	Connected	Active	Online	26	2026-08-08 00:17:40.636393
1034	1	Connected	Active	Online	26	2026-08-08 00:18:00.641517
1035	1	\N	\N	Online	\N	2026-08-08 00:18:01.474624
1036	1	\N	\N	Online	\N	2026-08-08 00:18:01.557722
1037	1	Connected	Active	Online	26	2026-08-08 00:18:20.673834
1038	1	\N	\N	Online	\N	2026-08-08 00:18:31.525994
1039	1	Connected	Active	Online	25	2026-08-08 00:18:40.681898
1040	1	Connected	Active	Online	25	2026-08-08 00:19:00.69136
1041	1	\N	\N	Online	\N	2026-08-08 00:19:01.653193
1042	1	\N	\N	Online	\N	2026-08-08 00:19:01.771606
1043	1	Connected	Active	Online	25	2026-08-08 00:19:20.708658
1044	1	\N	\N	Online	\N	2026-08-08 00:19:31.639314
1045	1	Connected	Active	Online	25	2026-08-08 00:19:40.726728
1046	1	Connected	Active	Online	25	2026-08-08 00:20:00.776073
1047	1	\N	\N	Online	\N	2026-08-08 00:20:01.750926
1048	1	\N	\N	Online	\N	2026-08-08 00:20:01.90159
1049	1	Connected	Active	Online	25	2026-08-08 00:20:20.913517
1050	1	\N	\N	Online	\N	2026-08-08 00:20:31.758975
1051	1	Connected	Active	Online	25	2026-08-08 00:20:40.854422
1052	1	Connected	Active	Online	25	2026-08-08 00:21:00.814231
1053	1	\N	\N	Online	\N	2026-08-08 00:21:01.771612
1054	1	\N	\N	Online	\N	2026-08-08 00:21:01.885013
1055	1	Connected	Active	Online	25	2026-08-08 00:21:20.84339
1056	1	\N	\N	Online	\N	2026-08-08 00:21:31.812362
1057	1	Connected	Active	Online	25	2026-08-08 00:21:40.832731
1058	1	Connected	Active	Online	25	2026-08-08 00:22:00.855047
1059	1	\N	\N	Online	\N	2026-08-08 00:22:01.859275
1060	1	\N	\N	Online	\N	2026-08-08 00:22:01.958496
1061	1	Connected	Active	Online	25	2026-08-08 00:22:20.887109
1062	1	\N	\N	Online	\N	2026-08-08 00:22:32.000257
1063	1	Connected	Active	Online	25	2026-08-08 00:22:40.881283
1064	1	Connected	Active	Online	25	2026-08-08 00:23:00.948807
1065	1	\N	\N	Online	\N	2026-08-08 00:23:01.943802
1066	1	\N	\N	Online	\N	2026-08-08 00:23:02.011717
1067	1	Connected	Active	Online	25	2026-08-08 00:23:20.984586
1068	1	\N	\N	Online	\N	2026-08-08 00:23:31.90262
1069	1	Connected	Active	Online	25	2026-08-08 00:23:40.928685
1070	1	Connected	Active	Online	25	2026-08-08 00:24:00.94083
1071	1	\N	\N	Online	\N	2026-08-08 00:24:01.993652
1072	1	\N	\N	Online	\N	2026-08-08 00:24:02.084552
1073	1	Connected	Active	Online	25	2026-08-08 00:24:20.95664
1074	1	\N	\N	Online	\N	2026-08-08 00:24:32.051119
1075	1	Connected	Active	Online	25	2026-08-08 00:24:40.981923
1076	1	Connected	Active	Online	24	2026-08-08 00:25:01.002977
1077	1	\N	\N	Online	\N	2026-08-08 00:25:02.159931
1078	1	\N	\N	Online	\N	2026-08-08 00:25:02.237051
1079	1	Connected	Active	Online	24	2026-08-08 00:25:21.01469
1080	1	\N	\N	Online	\N	2026-08-08 00:25:32.171329
1081	1	Connected	Active	Online	24	2026-08-08 00:25:41.022796
1082	1	Connected	Active	Online	24	2026-08-08 00:26:01.063264
1083	1	\N	\N	Online	\N	2026-08-08 00:26:02.284901
1084	1	\N	\N	Online	\N	2026-08-08 00:26:02.392637
1085	1	\N	\N	Online	\N	2026-08-08 00:31:49.981797
1086	1	\N	\N	Online	\N	2026-08-08 00:31:50.016788
1087	1	\N	\N	Online	\N	2026-08-08 00:31:50.018386
1088	1	Connected	Unknown	Online	23	2026-08-08 00:31:50.032589
1089	1	Connected	Unknown	Online	23	2026-08-08 00:31:50.125389
1090	1	\N	\N	Online	\N	2026-08-08 00:31:50.136364
1091	1	\N	\N	Online	\N	2026-08-08 00:31:50.156669
1092	1	\N	\N	Online	\N	2026-08-08 00:31:50.157912
1093	1	\N	\N	Online	\N	2026-08-08 00:31:50.214233
1094	1	\N	\N	Online	\N	2026-08-08 00:31:50.280079
1095	1	Connected	Active	Online	23	2026-08-08 00:32:09.639714
1096	1	Connected	Active	Online	23	2026-08-08 00:32:29.629572
1097	1	Disconnected	Active	Online	0	2026-08-08 00:32:30.631897
1098	1	\N	\N	Online	\N	2026-08-08 00:32:49.620874
1099	1	Connected	Active	Online	23	2026-08-08 00:32:49.771636
1100	1	\N	\N	Online	\N	2026-08-08 00:33:55.483063
1101	1	Connected	Unknown	Online	23	2026-08-08 00:33:55.536819
1102	1	\N	\N	Online	\N	2026-08-08 00:33:55.539069
1103	1	Connected	Unknown	Online	23	2026-08-08 00:33:55.586571
1104	1	\N	\N	Online	\N	2026-08-08 00:33:55.724216
1105	1	\N	\N	Online	\N	2026-08-08 00:33:55.806268
1106	1	\N	\N	Online	\N	2026-08-08 00:34:00.859849
1107	1	\N	\N	Online	\N	2026-08-08 00:34:00.962677
1108	1	Connected	Active	Online	23	2026-08-08 00:34:15.25294
1109	1	Connected	Active	Online	23	2026-08-08 00:34:35.336535
1110	1	\N	\N	Online	\N	2026-08-08 00:34:55.281815
1111	1	Connected	Active	Online	23	2026-08-08 00:34:55.376285
1112	1	Connected	Active	Online	23	2026-08-08 00:35:15.316464
1113	1	Connected	Active	Online	23	2026-08-08 00:35:35.333493
1114	1	\N	\N	Online	\N	2026-08-08 00:35:55.27551
1115	1	Connected	Active	Online	23	2026-08-08 00:35:55.363983
1116	1	Connected	Active	Online	23	2026-08-08 00:36:15.384586
1117	1	Connected	Active	Online	23	2026-08-08 00:36:35.433415
1118	1	\N	\N	Online	\N	2026-08-08 00:36:55.314657
1119	1	Connected	Active	Online	23	2026-08-08 00:36:55.447143
1120	1	Connected	Active	Online	22	2026-08-08 00:37:15.43325
1121	1	Connected	Active	Online	22	2026-08-08 00:37:35.458944
1122	1	\N	\N	Online	\N	2026-08-08 00:37:55.31619
1123	1	Connected	Active	Online	22	2026-08-08 00:37:55.467951
1124	1	Connected	Active	Online	22	2026-08-08 00:38:15.490943
1125	1	Connected	Active	Online	22	2026-08-08 00:38:35.516626
1126	1	\N	\N	Online	\N	2026-08-08 00:38:55.353589
1127	1	Connected	Active	Online	22	2026-08-08 00:38:55.484037
1128	1	Connected	Active	Online	22	2026-08-08 00:39:15.519879
3211	1	\N	\N	Online	\N	2026-08-26 18:00:46.760613
3212	1	Connected	Unknown	Online	75	2026-08-26 18:01:03.233142
3213	1	Connected	Unknown	Online	75	2026-08-26 18:01:23.210511
3214	1	Connected	Unknown	Online	75	2026-08-26 18:01:43.213901
1133	1	Connected	Active	Online	22	2026-08-08 00:39:35.537984
3215	1	Connected	Unknown	Online	75	2026-08-26 18:02:03.201004
1136	1	\N	\N	Online	\N	2026-08-08 00:39:55.365921
1137	1	Connected	Active	Online	22	2026-08-08 00:39:55.567624
1138	1	Connected	Active	Online	22	2026-08-08 00:40:15.53513
1139	1	Connected	Active	Online	22	2026-08-08 00:40:35.658378
1140	1	\N	\N	Online	\N	2026-08-08 00:40:55.360208
1141	1	Connected	Active	Online	22	2026-08-08 00:40:55.607408
1142	1	Connected	Active	Online	22	2026-08-08 00:41:15.614388
1143	1	Connected	Active	Online	22	2026-08-08 00:41:35.652597
1144	1	\N	\N	Online	\N	2026-08-08 00:41:55.456866
1145	1	Connected	Active	Online	22	2026-08-08 00:41:55.650373
1146	1	Connected	Active	Online	22	2026-08-08 00:42:15.698553
1147	1	Connected	Active	Online	22	2026-08-08 00:42:35.698501
1148	1	\N	\N	Online	\N	2026-08-08 00:42:55.401048
1149	1	Connected	Active	Online	22	2026-08-08 00:42:55.721553
1150	1	Connected	Active	Online	22	2026-08-08 00:43:15.918332
1151	1	Connected	Active	Online	22	2026-08-08 00:43:35.736959
1152	1	\N	\N	Online	\N	2026-08-08 00:43:55.441716
1153	1	Connected	Active	Online	21	2026-08-08 00:43:55.753648
1154	1	Connected	Active	Online	21	2026-08-08 00:44:15.817834
1155	1	Connected	Active	Online	21	2026-08-08 00:44:35.775442
1156	1	\N	\N	Online	\N	2026-08-08 00:44:55.445675
1157	1	Connected	Active	Online	21	2026-08-08 00:44:55.827744
1158	1	Connected	Active	Online	21	2026-08-08 00:45:15.904443
1159	1	Connected	Active	Online	21	2026-08-08 00:45:35.858046
1160	1	\N	\N	Online	\N	2026-08-08 00:45:55.461429
1161	1	Connected	Active	Online	21	2026-08-08 00:45:55.873135
1162	1	Connected	Active	Online	21	2026-08-08 00:46:15.882406
1163	1	Connected	Active	Online	21	2026-08-08 00:46:35.916592
1164	1	\N	\N	Online	\N	2026-08-08 00:46:55.448411
1165	1	Connected	Active	Online	21	2026-08-08 00:46:55.865608
1166	1	Connected	Active	Online	21	2026-08-08 00:47:15.924168
1167	1	Connected	Active	Online	21	2026-08-08 00:47:35.932713
1168	1	\N	\N	Online	\N	2026-08-08 00:47:55.503165
1169	1	Connected	Active	Online	21	2026-08-08 00:47:55.924283
1170	1	Connected	Active	Online	21	2026-08-08 00:48:16.000724
1171	1	Connected	Active	Online	21	2026-08-08 00:48:35.995643
1172	1	\N	\N	Online	\N	2026-08-08 00:48:55.544026
1173	1	Connected	Active	Online	21	2026-08-08 00:48:55.998679
1174	1	Connected	Active	Online	21	2026-08-08 00:49:16.03545
1175	1	Connected	Active	Online	21	2026-08-08 00:49:36.043412
1176	1	\N	\N	Online	\N	2026-08-08 00:49:55.503908
1177	1	Connected	Active	Online	21	2026-08-08 00:49:56.151999
1178	1	Connected	Active	Online	20	2026-08-08 00:50:16.102492
1179	1	Connected	Active	Online	20	2026-08-08 00:50:36.058205
1180	1	\N	\N	Online	\N	2026-08-08 00:50:55.547721
1181	1	Connected	Active	Online	20	2026-08-08 00:50:56.124721
1182	1	Connected	Active	Online	20	2026-08-08 00:51:16.129002
1183	1	Connected	Active	Online	20	2026-08-08 00:51:36.126393
1184	1	\N	\N	Online	\N	2026-08-08 00:51:55.56019
1185	1	Connected	Active	Online	20	2026-08-08 00:51:56.178777
1186	1	Connected	Active	Online	20	2026-08-08 00:52:16.191235
1187	1	Connected	Active	Online	20	2026-08-08 00:52:36.199931
1188	1	\N	\N	Online	\N	2026-08-08 00:52:55.570958
1189	1	Connected	Active	Online	20	2026-08-08 00:52:56.212785
1190	1	Connected	Active	Online	20	2026-08-08 00:53:16.318517
1191	1	Connected	Active	Online	20	2026-08-08 00:53:36.260632
1192	1	\N	\N	Online	\N	2026-08-08 00:53:55.596217
1193	1	Connected	Active	Online	20	2026-08-08 00:53:56.246412
1194	1	Connected	Active	Online	20	2026-08-08 00:54:16.485809
1195	1	Connected	Active	Online	20	2026-08-08 00:54:36.248945
1196	1	\N	\N	Online	\N	2026-08-08 00:55:06.566851
1197	1	Connected	Unknown	Online	20	2026-08-08 00:55:06.607829
1198	1	\N	\N	Online	\N	2026-08-08 00:55:06.671355
1199	1	Connected	Unknown	Online	20	2026-08-08 00:55:06.676166
1200	1	\N	\N	Online	\N	2026-08-08 00:55:06.797323
1201	1	\N	\N	Online	\N	2026-08-08 00:55:06.91649
1202	1	\N	\N	Online	\N	2026-08-08 00:55:06.917332
1203	1	\N	\N	Online	\N	2026-08-08 00:55:06.918301
1204	1	\N	\N	Online	\N	2026-08-08 00:55:07.013316
1205	1	\N	\N	Online	\N	2026-08-08 00:55:07.102147
1206	1	Connected	Active	Online	20	2026-08-08 00:55:26.463732
1207	1	Connected	Active	Online	20	2026-08-08 00:55:46.406228
1208	1	\N	\N	Online	\N	2026-08-08 00:56:06.43363
1209	1	Connected	Active	Online	20	2026-08-08 00:56:06.524676
1210	1	Connected	Active	Online	20	2026-08-08 00:56:26.450166
1211	1	Connected	Active	Online	20	2026-08-08 00:56:46.467587
1212	1	\N	\N	Online	\N	2026-08-08 00:57:06.36439
1213	1	Connected	Active	Online	20	2026-08-08 00:57:06.550116
1214	1	Connected	Active	Online	19	2026-08-08 00:57:26.468089
1215	1	Connected	Active	Online	19	2026-08-08 00:57:46.471207
1216	1	\N	\N	Online	\N	2026-08-08 00:58:06.404332
1217	1	Connected	Active	Online	19	2026-08-08 00:58:06.512185
1218	1	Connected	Active	Online	19	2026-08-08 00:58:26.640674
1219	1	Connected	Active	Online	19	2026-08-08 00:58:46.534348
1220	1	Disconnected	Active	Online	0	2026-08-08 00:59:05.949556
1221	1	\N	\N	Online	\N	2026-08-08 01:00:02.588045
1222	1	\N	\N	Online	\N	2026-08-08 01:00:02.667812
1223	1	Connected	Unknown	Online	19	2026-08-08 01:00:02.668703
1224	1	Connected	Unknown	Online	19	2026-08-08 01:00:02.676119
1225	1	\N	\N	Online	\N	2026-08-08 01:00:02.885683
1226	1	\N	\N	Online	\N	2026-08-08 01:00:02.972347
1227	1	\N	\N	Online	\N	2026-08-08 01:00:03.02212
1228	1	\N	\N	Online	\N	2026-08-08 01:00:03.118923
1229	1	\N	\N	Online	\N	2026-08-08 01:00:03.11933
1230	1	\N	\N	Online	\N	2026-08-08 01:00:03.128799
1231	1	Connected	Active	Online	19	2026-08-08 01:00:22.352467
1232	1	Connected	Active	Online	19	2026-08-08 01:00:42.346388
3216	1	Connected	Unknown	Online	75	2026-08-26 18:02:23.206831
3217	1	Connected	Unknown	Online	75	2026-08-26 18:02:43.206724
3218	1	Connected	Unknown	Online	73	2026-08-26 18:03:03.2156
3219	1	Connected	Unknown	Online	73	2026-08-26 18:03:23.216414
3220	1	Connected	Unknown	Online	72	2026-08-26 18:03:43.226822
3221	1	Connected	Unknown	Online	72	2026-08-26 18:04:03.217248
3222	1	Connected	Unknown	Online	72	2026-08-26 18:04:23.20952
3223	1	Connected	Unknown	Online	72	2026-08-26 18:05:17.216194
3315	1	Connected	Unknown	Online	59	2026-08-29 14:44:22.361462
3316	1	Connected	Unknown	Online	59	2026-08-29 14:44:42.361001
3317	1	Connected	Unknown	Online	59	2026-08-29 14:45:02.371368
3318	1	Connected	Unknown	Online	59	2026-08-29 14:45:22.370505
3319	1	Connected	Unknown	Online	59	2026-08-29 14:45:42.365699
3320	1	Connected	Unknown	Online	59	2026-08-29 14:46:02.37556
3321	1	Connected	Unknown	Online	59	2026-08-29 14:46:22.370483
3322	1	Connected	Unknown	Online	59	2026-08-29 14:46:42.41446
3323	1	Connected	Unknown	Online	58	2026-08-29 14:47:02.388775
3324	1	Connected	Unknown	Online	58	2026-08-29 14:47:22.393871
3325	1	Connected	Unknown	Online	58	2026-08-29 14:47:42.398242
3326	1	Connected	Unknown	Online	58	2026-08-29 14:48:02.405473
3327	1	Connected	Unknown	Online	58	2026-08-29 14:48:22.404637
3328	1	Connected	Unknown	Online	58	2026-08-29 14:48:42.405708
3423	1	Connected	Unknown	Online	53	2026-08-29 15:19:21.998438
3472	1	Connected	Unknown	Online	49	2026-08-29 15:43:18.459239
3473	1	Connected	Unknown	Online	49	2026-08-29 15:43:38.441004
3560	1	Connected	Unknown	Online	42	2026-08-29 16:17:28.497557
3607	1	Connected	Unknown	Online	39	2026-08-29 16:33:32.756046
3608	1	Connected	Unknown	Online	39	2026-08-29 16:33:52.761076
3611	1	Connected	Unknown	Online	39	2026-08-29 16:34:52.774639
3668	1	Connected	Unknown	Online	34	2026-08-29 16:58:42.328236
3671	1	Connected	Unknown	Online	34	2026-08-29 16:59:42.342979
3780	1	Connected	Unknown	Online	79	2026-08-30 12:59:03.702231
3791	1	Connected	Unknown	Online	79	2026-08-30 13:02:43.972953
1947	1	\N	\N	Online	\N	2026-08-09 18:35:00.261087
1948	1	Connected	Active	Online	37	2026-08-09 18:35:00.298326
1949	1	Connected	Active	Online	37	2026-08-09 18:35:20.12141
1950	1	Connected	Active	Online	37	2026-08-09 18:35:40.307286
1951	1	\N	\N	Online	\N	2026-08-09 18:36:00.257483
1952	1	Connected	Active	Online	37	2026-08-09 18:36:41.132197
1953	1	\N	\N	Online	\N	2026-08-09 18:37:00.21469
1954	1	Connected	Active	Online	37	2026-08-09 18:37:42.401225
1955	1	\N	\N	Online	\N	2026-08-09 18:38:00.095649
1956	1	Connected	Active	Online	37	2026-08-09 18:38:43.105427
1957	1	\N	\N	Online	\N	2026-08-09 18:39:00.148825
1958	1	Connected	Active	Online	37	2026-08-09 18:39:44.815646
1959	1	\N	\N	Online	\N	2026-08-09 18:40:45.135582
1960	1	Connected	Active	Online	37	2026-08-09 18:40:45.156026
1961	1	\N	\N	Online	\N	2026-08-09 18:41:11.379457
1962	1	Connected	Active	Online	37	2026-08-09 18:41:11.538765
1963	1	\N	\N	Online	\N	2026-08-09 18:41:13.244268
1964	1	\N	\N	Online	\N	2026-08-09 18:41:13.245486
1965	1	Disconnected	Active	Online	0	2026-08-09 18:41:16.09481
1966	1	Connected	Active	Online	31	2026-08-09 18:41:20.212249
1967	1	Connected	Active	Online	31	2026-08-09 18:41:40.23519
1968	1	Connected	Active	Online	31	2026-08-09 18:42:01.342866
1969	1	\N	\N	Online	\N	2026-08-09 18:42:01.585261
1970	1	Connected	Active	Online	31	2026-08-09 18:42:55.218633
1971	1	\N	\N	Online	\N	2026-08-09 18:43:55.135901
1972	1	Connected	Active	Online	31	2026-08-09 18:43:55.177873
1973	1	\N	\N	Online	\N	2026-08-09 18:44:55.055471
1974	1	Connected	Active	Online	31	2026-08-09 18:44:55.104452
1975	1	\N	\N	Online	\N	2026-08-09 18:45:28.802127
1976	1	Connected	Active	Online	31	2026-08-09 18:45:28.835976
1977	1	Disconnected	Active	Online	0	2026-08-09 18:45:30.33281
1978	1	Connected	Active	Online	41	2026-08-09 18:45:40.822553
1979	1	\N	\N	Online	\N	2026-08-09 18:46:00.118889
1980	1	Connected	Active	Online	41	2026-08-09 18:46:00.187385
1981	1	Connected	Active	Online	41	2026-08-09 18:46:20.158123
1982	1	Connected	Active	Online	41	2026-08-09 18:46:55.131969
3224	1	Connected	Inactive	Online	62	2026-08-29 14:25:30.424751
3227	1	\N	\N	Online	\N	2026-08-29 14:25:48.834691
3329	1	Connected	Unknown	Online	58	2026-08-29 14:49:02.424841
3330	1	Connected	Unknown	Online	58	2026-08-29 14:49:22.416749
3424	1	Connected	Unknown	Online	53	2026-08-29 15:19:42.003762
3425	1	Connected	Unknown	Online	53	2026-08-29 15:20:01.99859
3474	1	Connected	Unknown	Online	49	2026-08-29 15:43:58.452024
3477	1	Connected	Unknown	Online	49	2026-08-29 15:44:58.491539
3478	1	Connected	Unknown	Online	48	2026-08-29 15:45:18.463661
3481	1	Connected	Unknown	Online	48	2026-08-29 15:46:18.481145
3561	1	Connected	Unknown	Online	42	2026-08-29 16:17:48.716938
3609	1	Connected	Unknown	Online	39	2026-08-29 16:34:12.768803
3612	1	Connected	Unknown	Online	39	2026-08-29 16:35:12.762725
3670	1	Connected	Unknown	Online	34	2026-08-29 16:59:22.286972
3673	1	Connected	Unknown	Online	34	2026-08-29 17:00:22.30779
3680	1	Connected	Unknown	Online	33	2026-08-29 17:02:42.326507
3681	1	Connected	Unknown	Online	33	2026-08-29 17:03:02.331753
3792	1	Connected	Unknown	Online	79	2026-08-30 13:03:03.89208
3795	1	Connected	Unknown	Online	79	2026-08-30 13:04:03.780172
3905	1	Connected	Unknown	Online	19	2026-08-30 16:50:53.181845
3907	1	Connected	Unknown	Online	19	2026-08-30 16:51:33.20341
3909	1	Connected	Unknown	Online	20	2026-08-30 16:52:13.194598
3917	1	Connected	Unknown	Online	22	2026-08-30 16:54:53.344813
3956	1	Connected	Unknown	Online	31	2026-08-30 17:08:24.289516
4023	1	Connected	Unknown	Online	43	2026-09-06 13:41:35.512025
4026	1	Connected	Unknown	Online	43	2026-09-06 13:42:35.485399
4032	1	Connected	Unknown	Online	43	2026-09-06 13:43:28.643248
4068	1	Connected	Unknown	Online	41	2026-09-06 13:55:41.618085
4122	1	Connected	Unknown	Online	38	2026-09-06 14:13:41.926177
4185	1	Connected	Unknown	Online	34	2026-09-06 14:33:47.689587
4249	1	Connected	Unknown	Online	30	2026-09-06 14:54:21.143837
4252	1	Connected	Unknown	Online	30	2026-09-06 14:55:21.139729
4308	1	Connected	Unknown	Online	24	2026-09-06 15:18:21.51855
4310	1	Connected	Unknown	Online	24	2026-09-06 15:18:41.56282
4314	1	Connected	Unknown	Online	24	2026-09-06 15:20:01.587133
4398	1	Connected	Unknown	Online	18	2026-09-06 15:49:22.112772
4666	1	Connected	Unknown	Online	25	2026-09-06 17:15:11.101363
4673	1	Connected	Unknown	Online	25	2026-09-06 17:17:31.014007
4743	1	Connected	Unknown	Online	26	2026-09-06 17:38:47.514623
4794	1	Connected	Unknown	Online	32	2026-09-06 17:53:29.413841
4796	1	Connected	Unknown	Online	32	2026-09-06 17:54:09.436709
4797	1	Connected	Unknown	Online	32	2026-09-06 17:54:29.622812
4798	1	Connected	Unknown	Online	32	2026-09-06 17:54:50.260433
4799	1	Connected	Unknown	Online	32	2026-09-06 17:55:09.480107
4804	1	Connected	Unknown	Online	32	2026-09-06 17:56:49.630779
4838	1	Connected	Unknown	Online	33	2026-09-06 18:07:50.956354
4842	1	Connected	Unknown	Online	33	2026-09-06 18:09:11.064297
4845	1	Connected	Unknown	Online	33	2026-09-06 18:10:11.105136
4846	1	Connected	Unknown	Online	33	2026-09-06 18:10:31.111859
4848	1	Connected	Unknown	Online	33	2026-09-06 18:11:11.154635
4849	1	Connected	Unknown	Online	33	2026-09-06 18:11:31.394344
3225	1	Connected	Inactive	Online	62	2026-08-29 14:25:30.424247
3226	1	\N	\N	Online	\N	2026-08-29 14:25:48.800433
3230	1	Connected	Active	Online	62	2026-08-29 14:26:10.358448
3231	1	\N	\N	Online	\N	2026-08-29 14:26:18.811518
3331	1	Connected	Unknown	Online	58	2026-08-29 14:49:42.438221
3332	1	Connected	Unknown	Online	58	2026-08-29 14:50:02.443894
3333	1	Connected	Unknown	Online	58	2026-08-29 14:50:22.428615
3334	1	Connected	Unknown	Online	58	2026-08-29 14:50:42.430126
3335	1	Connected	Unknown	Online	58	2026-08-29 14:51:02.425633
3336	1	Connected	Unknown	Online	58	2026-08-29 14:51:22.46799
3337	1	Connected	Unknown	Online	58	2026-08-29 14:51:42.445933
3426	1	Connected	Unknown	Online	53	2026-08-29 15:20:22.014729
3427	1	Connected	Unknown	Online	53	2026-08-29 15:20:42.007986
3429	1	Connected	Unknown	Online	53	2026-08-29 15:21:22.012111
3435	1	\N	\N	Online	\N	2026-08-29 15:23:02.454082
3437	1	\N	\N	Online	\N	2026-08-29 15:23:10.271728
3438	1	Connected	Unknown	Online	53	2026-08-29 15:23:21.933748
3442	1	Connected	Unknown	Online	52	2026-08-29 15:24:41.949176
3443	1	Connected	Unknown	Online	52	2026-08-29 15:25:22.004631
3446	1	Connected	Unknown	Online	52	2026-08-29 15:27:41.996357
3482	1	Connected	Unknown	Online	47	2026-08-29 15:54:55.526488
3487	1	\N	\N	Online	\N	2026-08-29 15:55:58.566661
3488	1	\N	\N	Online	\N	2026-08-29 15:55:58.796286
3494	1	Connected	Unknown	Online	46	2026-08-29 15:57:38.224168
3562	1	Connected	Unknown	Online	42	2026-08-29 16:18:08.510386
3610	1	Connected	Unknown	Online	39	2026-08-29 16:34:32.766593
3672	1	Connected	Unknown	Online	34	2026-08-29 17:00:02.316447
3674	1	Connected	Unknown	Online	34	2026-08-29 17:00:42.307153
3675	1	Connected	Unknown	Online	34	2026-08-29 17:01:02.306403
3799	1	Connected	Unknown	Online	78	2026-08-30 13:05:23.771977
3805	1	Connected	Unknown	Online	78	2026-08-30 13:07:23.768095
3809	1	Connected	Unknown	Online	78	2026-08-30 13:08:43.794162
3906	1	Connected	Unknown	Online	19	2026-08-30 16:51:13.261739
3911	1	Connected	Unknown	Online	20	2026-08-30 16:52:53.21913
3918	1	Connected	Unknown	Online	22	2026-08-30 16:55:13.405504
3957	1	Connected	Unknown	Online	31	2026-08-30 17:08:44.819122
3958	1	Connected	Unknown	Online	47	2026-09-06 13:17:51.290771
4024	1	Connected	Unknown	Online	43	2026-09-06 13:41:55.526257
4025	1	Connected	Unknown	Online	43	2026-09-06 13:42:15.491153
4035	1	Connected	Unknown	Online	43	2026-09-06 13:44:28.694892
4042	1	Unknown	Unknown	Online	\N	2026-09-06 13:46:34.634337
4070	1	Connected	Unknown	Online	41	2026-09-06 13:56:21.629321
4072	1	Connected	Unknown	Online	41	2026-09-06 13:57:01.660014
4123	1	Connected	Unknown	Online	38	2026-09-06 14:14:02.254226
4189	1	Connected	Unknown	Online	34	2026-09-06 14:35:07.71767
4190	1	Connected	Unknown	Online	34	2026-09-06 14:35:27.713316
4192	1	Connected	Unknown	Online	34	2026-09-06 14:36:07.75677
4254	1	Connected	Unknown	Online	30	2026-09-06 14:56:01.193732
4312	1	Connected	Unknown	Online	24	2026-09-06 15:19:21.519761
4317	1	Connected	Unknown	Online	23	2026-09-06 15:21:01.578947
4399	1	Connected	Unknown	Online	18	2026-09-06 15:49:42.152679
4400	1	Connected	Unknown	Online	18	2026-09-06 15:50:02.176053
4403	1	Connected	Unknown	Online	18	2026-09-06 15:51:02.309187
4408	1	Connected	Unknown	Online	18	2026-09-06 15:51:50.583645
4409	1	Connected	Unknown	Online	16	2026-09-06 15:52:56.274216
4415	1	Connected	Unknown	Online	15	2026-09-06 15:53:56.118881
4416	1	Connected	Unknown	Online	15	2026-09-06 15:54:16.058078
4417	1	Connected	Unknown	Online	15	2026-09-06 15:54:36.022637
4421	1	Connected	Unknown	Online	14	2026-09-06 15:55:56.040702
4423	1	Connected	Unknown	Online	14	2026-09-06 15:56:36.02843
4424	1	Connected	Unknown	Online	14	2026-09-06 15:56:56.222442
4426	1	Unknown	Unknown	Online	\N	2026-09-06 15:57:34.005296
4432	1	Connected	Unknown	Online	13	2026-09-06 15:58:51.178471
4438	1	Connected	Unknown	Online	13	2026-09-06 16:00:31.263203
4440	1	Connected	Unknown	Online	13	2026-09-06 16:01:11.26685
4446	1	Connected	Unknown	Online	12	2026-09-06 16:03:11.420123
4447	1	Connected	Unknown	Online	12	2026-09-06 16:03:31.389885
4450	1	Connected	Unknown	Online	12	2026-09-06 16:04:31.435544
4451	1	Connected	Unknown	Online	12	2026-09-06 16:04:51.428369
4667	1	Connected	Unknown	Online	25	2026-09-06 17:15:30.996697
4744	1	Connected	Unknown	Online	26	2026-09-06 17:39:07.471297
4795	1	Connected	Unknown	Online	32	2026-09-06 17:53:49.452355
4839	1	Connected	Unknown	Online	33	2026-09-06 18:08:11.075618
3228	1	Connected	Active	Online	62	2026-08-29 14:25:50.355514
3229	1	\N	\N	Online	\N	2026-08-29 14:25:50.382259
3232	1	Connected	Active	Online	62	2026-08-29 14:26:30.351554
3233	1	\N	\N	Online	\N	2026-08-29 14:26:48.871832
3236	1	Connected	Active	Online	62	2026-08-29 14:27:10.374011
3237	1	\N	\N	Online	\N	2026-08-29 14:27:18.836232
3240	1	Connected	Active	Online	62	2026-08-29 14:27:50.366949
3241	1	\N	\N	Online	\N	2026-08-29 14:27:50.450968
3244	1	Connected	Active	Online	62	2026-08-29 14:28:30.381209
3245	1	\N	\N	Online	\N	2026-08-29 14:28:48.861621
3256	1	Connected	Active	Online	62	2026-08-29 14:30:30.41667
3257	1	Disconnected	Active	Online	0	2026-08-29 14:30:33.574633
3258	1	\N	\N	Online	\N	2026-08-29 14:30:57.811632
3259	1	Connected	Inactive	Online	61	2026-08-29 14:30:57.844785
3338	1	Connected	Unknown	Online	58	2026-08-29 14:52:02.747756
3428	1	Connected	Unknown	Online	53	2026-08-29 15:21:02.018868
3483	1	Connected	Active	Online	100	2026-08-29 15:55:04.571826
3484	1	Connected	Unknown	Online	47	2026-08-29 15:55:15.392994
3485	1	Connected	Unknown	Online	47	2026-08-29 15:55:35.437123
3486	1	Connected	Unknown	Online	47	2026-08-29 15:55:58.261048
3563	1	Connected	Unknown	Online	42	2026-08-29 16:18:29.584118
3565	1	Connected	Unknown	Online	42	2026-08-29 16:19:08.513712
3613	1	Connected	Unknown	Online	38	2026-08-29 16:37:55.884738
3682	1	Connected	Unknown	Online	33	2026-08-29 17:03:22.521451
3810	1	Connected	Unknown	Online	78	2026-08-30 13:09:03.949731
3811	1	Connected	Unknown	Online	78	2026-08-30 13:09:23.835758
3812	1	Connected	Unknown	Online	78	2026-08-30 13:09:43.817143
3813	1	Connected	Unknown	Online	78	2026-08-30 13:10:03.819917
3908	1	Connected	Unknown	Online	19	2026-08-30 16:51:53.200085
3912	1	Connected	Unknown	Online	20	2026-08-30 16:53:13.253873
3959	1	Connected	Unknown	Online	47	2026-09-06 13:18:11.365429
3968	1	Connected	Unknown	Online	47	2026-09-06 13:22:30.083829
3975	1	Connected	Unknown	Online	46	2026-09-06 13:24:50.13343
3977	1	Connected	Unknown	Online	46	2026-09-06 13:25:30.170492
3980	1	Connected	Unknown	Online	46	2026-09-06 13:26:30.191929
4027	1	Connected	Unknown	Online	43	2026-09-06 13:42:55.51308
4029	1	Unknown	Unknown	Online	\N	2026-09-06 13:43:09.330546
4071	1	Connected	Unknown	Online	41	2026-09-06 13:56:41.616811
4073	1	Connected	Unknown	Online	41	2026-09-06 13:57:21.705729
4086	1	Connected	Unknown	Online	39	2026-09-06 14:01:41.711975
4124	1	Connected	Unknown	Online	38	2026-09-06 14:14:21.99942
4193	1	Connected	Unknown	Online	34	2026-09-06 14:36:27.851181
4255	1	Connected	Unknown	Online	30	2026-09-06 14:56:21.159983
4319	1	Connected	Unknown	Online	23	2026-09-06 15:21:41.639275
4406	1	Unknown	Unknown	Online	\N	2026-09-06 15:51:33.939911
4410	1	Unknown	Unknown	Online	\N	2026-09-06 15:52:58.89056
4413	1	Connected	Unknown	Online	15	2026-09-06 15:53:16.20779
4414	1	Connected	Unknown	Online	15	2026-09-06 15:53:36.253034
4418	1	Connected	Unknown	Online	14	2026-09-06 15:54:55.986951
4419	1	Connected	Unknown	Online	14	2026-09-06 15:55:15.993947
4420	1	Connected	Unknown	Online	14	2026-09-06 15:55:36.002078
4422	1	Connected	Unknown	Online	14	2026-09-06 15:56:16.016965
4425	1	Connected	Unknown	Online	13	2026-09-06 15:57:31.597423
4429	1	Connected	Unknown	Online	13	2026-09-06 15:57:51.133066
4430	1	Connected	Unknown	Online	13	2026-09-06 15:58:11.243098
4431	1	Connected	Unknown	Online	13	2026-09-06 15:58:31.177707
4433	1	Connected	Unknown	Online	13	2026-09-06 15:59:11.198646
4434	1	Unknown	Unknown	Online	\N	2026-09-06 15:59:27.012527
4668	1	Connected	Unknown	Online	25	2026-09-06 17:15:51.051643
4669	1	Connected	Unknown	Online	25	2026-09-06 17:16:11.061401
4671	1	Connected	Unknown	Online	25	2026-09-06 17:16:51.062358
4674	1	Connected	Unknown	Online	25	2026-09-06 17:17:51.098761
4675	1	Connected	Unknown	Online	25	2026-09-06 17:18:11.243009
4676	1	Connected	Unknown	Online	25	2026-09-06 17:18:31.207395
4745	1	Connected	Unknown	Online	26	2026-09-06 17:39:27.490352
4754	1	Connected	Unknown	Online	28	2026-09-06 17:42:27.621974
4755	1	Connected	Unknown	Online	28	2026-09-06 17:42:47.839117
4800	1	Connected	Unknown	Online	32	2026-09-06 17:55:29.523248
4801	1	Connected	Unknown	Online	32	2026-09-06 17:55:49.516214
4841	1	Connected	Unknown	Online	33	2026-09-06 18:08:51.231845
4851	1	Connected	Unknown	Online	33	2026-09-06 18:12:11.150889
3234	1	Connected	Active	Online	62	2026-08-29 14:26:50.381901
3235	1	\N	\N	Online	\N	2026-08-29 14:26:50.457821
3238	1	Connected	Active	Online	62	2026-08-29 14:27:30.373246
3239	1	\N	\N	Online	\N	2026-08-29 14:27:48.820031
3242	1	Connected	Active	Online	62	2026-08-29 14:28:10.523782
3243	1	\N	\N	Online	\N	2026-08-29 14:28:18.852678
3339	1	Connected	Unknown	Online	58	2026-08-29 14:52:22.545889
3341	1	Connected	Unknown	Online	58	2026-08-29 14:53:02.453559
3343	1	Connected	Unknown	Online	58	2026-08-29 14:53:41.732399
3345	1	\N	\N	Online	\N	2026-08-29 14:53:42.146653
3348	1	Connected	Unknown	Online	57	2026-08-29 14:54:21.705506
3351	1	Connected	Unknown	Online	57	2026-08-29 14:55:21.719697
3353	1	Connected	Unknown	Online	57	2026-08-29 14:56:01.708022
3355	1	Connected	Unknown	Online	57	2026-08-29 14:56:41.731641
3358	1	Connected	Unknown	Online	57	2026-08-29 14:57:41.730422
3360	1	Connected	Unknown	Online	57	2026-08-29 14:58:21.866715
3430	1	Connected	Unknown	Online	53	2026-08-29 15:21:42.022332
3431	1	Connected	Unknown	Online	53	2026-08-29 15:22:02.034569
3489	1	\N	\N	Online	\N	2026-08-29 15:55:58.803737
3490	1	Connected	Unknown	Online	47	2026-08-29 15:56:18.212679
3491	1	Connected	Unknown	Online	46	2026-08-29 15:56:38.239902
3492	1	Connected	Unknown	Online	46	2026-08-29 15:56:58.242763
3564	1	Connected	Unknown	Online	42	2026-08-29 16:18:48.550775
3614	1	Connected	Unknown	Online	38	2026-08-29 16:38:12.856289
3615	1	Connected	Unknown	Online	38	2026-08-29 16:38:32.806589
3619	1	Connected	Active	Online	85	2026-08-29 16:39:39.724859
3620	1	Connected	Unknown	Online	38	2026-08-29 16:39:52.825574
3683	1	Connected	Unknown	Online	33	2026-08-29 17:03:42.362778
3817	1	Connected	Unknown	Online	78	2026-08-30 13:11:23.837609
3824	1	Connected	Unknown	Online	77	2026-08-30 13:13:43.856006
3826	1	Connected	Unknown	Online	77	2026-08-30 13:14:23.94325
3830	1	Connected	Unknown	Online	77	2026-08-30 13:15:43.902949
3910	1	Connected	Unknown	Online	20	2026-08-30 16:52:33.204416
3960	1	Connected	Unknown	Online	47	2026-09-06 13:18:31.368127
3962	1	Connected	Unknown	Online	47	2026-09-06 13:19:11.343066
3964	1	Connected	Unknown	Online	47	2026-09-06 13:22:10.253851
3965	1	Unknown	Unknown	Online	\N	2026-09-06 13:22:10.397722
3969	1	Connected	Unknown	Online	47	2026-09-06 13:22:50.123483
4028	1	Connected	Unknown	Online	43	2026-09-06 13:43:08.833778
4030	1	Unknown	Unknown	Online	\N	2026-09-06 13:43:09.568926
4037	1	Connected	Unknown	Online	43	2026-09-06 13:45:08.672823
4046	1	Connected	Unknown	Online	42	2026-09-06 13:47:31.161772
4049	1	Connected	Unknown	Online	42	2026-09-06 13:48:31.105041
4050	1	Connected	Unknown	Online	42	2026-09-06 13:48:51.171316
4074	1	Connected	Unknown	Online	41	2026-09-06 13:57:41.670681
4077	1	Connected	Unknown	Online	41	2026-09-06 13:58:41.68652
4078	1	Connected	Unknown	Online	41	2026-09-06 13:59:01.672191
4080	1	Connected	Unknown	Online	41	2026-09-06 13:59:41.739043
4083	1	Connected	Unknown	Online	40	2026-09-06 14:00:41.704807
4125	1	Connected	Unknown	Online	38	2026-09-06 14:14:41.956627
4196	1	Connected	Unknown	Online	33	2026-09-06 14:37:27.736771
4197	1	Connected	Unknown	Online	33	2026-09-06 14:37:47.750875
4199	1	Connected	Unknown	Online	33	2026-09-06 14:38:27.729836
4200	1	Connected	Unknown	Online	33	2026-09-06 14:38:47.742079
4202	1	Connected	Unknown	Online	33	2026-09-06 14:39:27.756076
4256	1	Connected	Unknown	Online	27	2026-09-06 15:01:02.014006
4260	1	Connected	Unknown	Online	27	2026-09-06 15:02:21.296404
4320	1	Connected	Unknown	Online	23	2026-09-06 15:22:01.657898
4324	1	Connected	Unknown	Online	23	2026-09-06 15:24:21.218884
4411	1	Unknown	Unknown	Online	\N	2026-09-06 15:52:59.954764
4412	1	Unknown	Unknown	Online	\N	2026-09-06 15:53:00.070041
4670	1	Connected	Unknown	Online	25	2026-09-06 17:16:31.027006
4747	1	Connected	Unknown	Online	27	2026-09-06 17:40:07.514413
4748	1	Connected	Unknown	Online	27	2026-09-06 17:40:27.529663
4749	1	Connected	Unknown	Online	27	2026-09-06 17:40:47.569846
4802	1	Connected	Unknown	Online	32	2026-09-06 17:56:09.526296
4844	1	Connected	Unknown	Online	33	2026-09-06 18:09:51.057719
3246	1	Connected	Active	Online	62	2026-08-29 14:28:50.378242
3247	1	\N	\N	Online	\N	2026-08-29 14:28:50.416469
3250	1	Connected	Active	Online	62	2026-08-29 14:29:30.404303
3251	1	\N	\N	Online	\N	2026-08-29 14:29:48.90877
3254	1	Connected	Active	Online	62	2026-08-29 14:30:10.443681
3255	1	\N	\N	Online	\N	2026-08-29 14:30:18.895168
3340	1	Connected	Unknown	Online	58	2026-08-29 14:52:42.467576
3342	1	Connected	Unknown	Online	58	2026-08-29 14:53:22.453252
3344	1	\N	\N	Online	\N	2026-08-29 14:53:41.948216
3346	1	\N	\N	Online	\N	2026-08-29 14:53:42.17796
3347	1	Connected	Unknown	Online	57	2026-08-29 14:54:01.693491
3439	1	Connected	Unknown	Online	53	2026-08-29 15:23:41.945205
3493	1	Connected	Unknown	Online	46	2026-08-29 15:57:18.234212
3566	1	Connected	Unknown	Online	42	2026-08-29 16:19:28.545774
3616	1	Connected	Unknown	Online	38	2026-08-29 16:38:52.838147
3684	1	Connected	Unknown	Online	33	2026-08-29 17:04:03.449258
3818	1	Connected	Unknown	Online	78	2026-08-30 13:11:43.838554
3819	1	Connected	Unknown	Online	78	2026-08-30 13:12:03.83809
3913	1	Connected	Unknown	Online	21	2026-08-30 16:53:33.263358
3914	1	Connected	Unknown	Online	21	2026-08-30 16:53:53.315314
3915	1	Connected	Unknown	Online	21	2026-08-30 16:54:13.375386
3919	1	Connected	Unknown	Online	22	2026-08-30 16:55:33.375508
3961	1	Connected	Unknown	Online	47	2026-09-06 13:18:51.330769
3963	1	Connected	Unknown	Online	47	2026-09-06 13:19:31.348699
4033	1	Connected	Unknown	Online	43	2026-09-06 13:43:48.729602
4034	1	Connected	Unknown	Online	43	2026-09-06 13:44:08.661101
4036	1	Connected	Unknown	Online	43	2026-09-06 13:44:48.658353
4075	1	Connected	Unknown	Online	41	2026-09-06 13:58:01.657452
4126	1	Connected	Unknown	Online	38	2026-09-06 14:15:01.907311
4203	1	Connected	Unknown	Online	33	2026-09-06 14:39:47.778278
4257	1	Connected	Unknown	Online	27	2026-09-06 15:01:21.26847
4259	1	Connected	Unknown	Online	27	2026-09-06 15:02:01.36018
4321	1	Connected	Unknown	Online	23	2026-09-06 15:22:21.646835
4427	1	Unknown	Unknown	Online	\N	2026-09-06 15:57:35.043269
4428	1	Unknown	Unknown	Online	\N	2026-09-06 15:57:35.133124
4677	1	Connected	Unknown	Online	25	2026-09-06 17:18:51.129494
4678	1	Connected	Unknown	Online	25	2026-09-06 17:19:11.131893
4680	1	Connected	Unknown	Online	25	2026-09-06 17:19:51.142274
4681	1	Connected	Unknown	Online	25	2026-09-06 17:20:11.158655
4682	1	Connected	Unknown	Online	24	2026-09-06 17:20:31.228969
4683	1	Connected	Unknown	Online	24	2026-09-06 17:20:51.196627
4686	1	Connected	Unknown	Online	24	2026-09-06 17:21:51.255591
4687	1	Connected	Unknown	Online	23	2026-09-06 17:22:11.227707
4694	1	Connected	Unknown	Online	23	2026-09-06 17:24:31.308774
4696	1	Unknown	Unknown	Online	\N	2026-09-06 17:24:33.957704
4751	1	Connected	Unknown	Online	28	2026-09-06 17:41:27.577454
4756	1	Connected	Unknown	Online	29	2026-09-06 17:43:07.803908
4803	1	Connected	Unknown	Online	32	2026-09-06 17:56:29.543708
4809	1	Connected	Unknown	Online	32	2026-09-06 17:58:39.46931
4847	1	Connected	Unknown	Online	33	2026-09-06 18:10:51.453185
3248	1	Connected	Active	Online	62	2026-08-29 14:29:10.398544
3249	1	\N	\N	Online	\N	2026-08-29 14:29:18.940643
3252	1	Connected	Active	Online	62	2026-08-29 14:29:50.411425
3253	1	\N	\N	Online	\N	2026-08-29 14:29:50.494286
3349	1	Connected	Unknown	Online	57	2026-08-29 14:54:41.722469
3350	1	Connected	Unknown	Online	57	2026-08-29 14:55:01.702083
3352	1	Connected	Unknown	Online	57	2026-08-29 14:55:41.718811
3354	1	Connected	Unknown	Online	57	2026-08-29 14:56:21.744988
3356	1	Connected	Unknown	Online	57	2026-08-29 14:57:01.73975
3357	1	Connected	Unknown	Online	57	2026-08-29 14:57:21.732636
3440	1	Connected	Unknown	Online	52	2026-08-29 15:24:01.961312
3441	1	Connected	Unknown	Online	52	2026-08-29 15:24:21.961675
3495	1	Connected	Unknown	Online	46	2026-08-29 15:57:58.249299
3497	1	Connected	Unknown	Online	46	2026-08-29 15:58:38.221256
3498	1	Connected	Unknown	Online	46	2026-08-29 15:58:58.254223
3567	1	Connected	Unknown	Online	42	2026-08-29 16:19:48.781267
3569	1	Connected	Unknown	Online	42	2026-08-29 16:20:28.536862
3617	1	Connected	Unknown	Online	38	2026-08-29 16:39:12.829365
3621	1	Connected	Unknown	Online	38	2026-08-29 16:40:12.819953
3685	1	Connected	Unknown	Online	33	2026-08-29 17:04:22.370197
3820	1	Connected	Unknown	Online	78	2026-08-30 13:12:23.826744
3821	1	Connected	Unknown	Online	78	2026-08-30 13:12:43.833823
3822	1	Connected	Unknown	Online	78	2026-08-30 13:13:03.839816
3916	1	Connected	Unknown	Online	21	2026-08-30 16:54:33.350205
3920	1	Connected	Unknown	Online	58	2026-08-30 16:55:41.029266
3966	1	Unknown	Unknown	Online	\N	2026-09-06 13:22:10.743242
4038	1	Connected	Unknown	Online	43	2026-09-06 13:45:28.676852
4076	1	Connected	Unknown	Online	41	2026-09-06 13:58:21.737539
4127	1	Connected	Unknown	Online	38	2026-09-06 14:15:21.970706
4205	1	Connected	Unknown	Online	33	2026-09-06 14:40:27.786718
4258	1	Connected	Unknown	Online	27	2026-09-06 15:01:41.299449
4262	1	Connected	Unknown	Online	27	2026-09-06 15:03:01.268745
4322	1	Connected	Unknown	Online	23	2026-09-06 15:22:41.623742
4435	1	Connected	Unknown	Online	13	2026-09-06 15:59:31.254215
4436	1	Connected	Unknown	Online	13	2026-09-06 15:59:51.198792
4437	1	Connected	Unknown	Online	13	2026-09-06 16:00:11.235298
4439	1	Connected	Unknown	Online	13	2026-09-06 16:00:51.289072
4441	1	Connected	Unknown	Online	13	2026-09-06 16:01:31.284418
4442	1	Connected	Unknown	Online	13	2026-09-06 16:01:51.483649
4443	1	Connected	Unknown	Online	13	2026-09-06 16:02:11.312529
4444	1	Connected	Unknown	Online	13	2026-09-06 16:02:31.31872
4445	1	Connected	Unknown	Online	13	2026-09-06 16:02:51.343862
4448	1	Connected	Unknown	Online	12	2026-09-06 16:03:51.375912
4449	1	Connected	Unknown	Online	12	2026-09-06 16:04:11.359316
4455	1	Unknown	Unknown	Online	\N	2026-09-06 16:05:26.022999
4461	1	Connected	Unknown	Online	12	2026-09-06 16:07:05.190137
4463	1	Connected	Unknown	Online	12	2026-09-06 16:07:45.477186
4679	1	Connected	Unknown	Online	25	2026-09-06 17:19:31.111208
4689	1	Connected	Unknown	Online	23	2026-09-06 17:22:51.193788
4690	1	Connected	Unknown	Online	23	2026-09-06 17:23:11.225765
4692	1	Connected	Unknown	Online	23	2026-09-06 17:23:51.272109
4693	1	Connected	Unknown	Online	23	2026-09-06 17:24:11.287514
4699	1	Connected	Unknown	Online	23	2026-09-06 17:25:11.327566
4702	1	Connected	Unknown	Online	23	2026-09-06 17:26:11.395645
4752	1	Connected	Unknown	Online	28	2026-09-06 17:41:47.614206
4753	1	Connected	Unknown	Online	28	2026-09-06 17:42:07.637595
4805	1	Connected	Unknown	Online	32	2026-09-06 17:57:09.574738
4850	1	Connected	Unknown	Online	33	2026-09-06 18:11:51.142752
3260	1	\N	\N	Online	\N	2026-08-29 14:30:57.901893
3359	1	Connected	Unknown	Online	57	2026-08-29 14:58:01.746862
3444	1	Connected	Unknown	Online	52	2026-08-29 15:26:22.035006
3496	1	Connected	Unknown	Online	46	2026-08-29 15:58:18.24892
3499	1	Connected	Unknown	Online	46	2026-08-29 15:59:18.269418
3501	1	Connected	Unknown	Online	46	2026-08-29 15:59:58.281549
3504	1	Connected	Unknown	Online	46	2026-08-29 16:00:58.294233
3508	1	Connected	Unknown	Online	45	2026-08-29 16:02:18.264069
3509	1	Connected	Unknown	Online	45	2026-08-29 16:02:38.297921
3568	1	Connected	Unknown	Online	42	2026-08-29 16:20:08.696876
3618	1	Connected	Unknown	Online	38	2026-08-29 16:39:32.828941
3622	1	Connected	Unknown	Online	38	2026-08-29 16:40:32.83858
3686	1	Connected	Unknown	Online	33	2026-08-29 17:04:42.444763
3688	1	Connected	Unknown	Online	33	2026-08-29 17:05:22.343096
3690	1	Connected	Unknown	Online	33	2026-08-29 17:06:02.375186
3692	1	Connected	Unknown	Online	33	2026-08-29 17:06:42.415277
3699	1	Connected	Unknown	Online	32	2026-08-29 17:09:02.408002
3707	1	Connected	Unknown	Online	32	2026-08-29 17:11:42.442429
3708	1	Connected	Unknown	Online	32	2026-08-29 17:12:02.460038
3711	1	Connected	Unknown	Online	31	2026-08-29 17:13:02.459794
3712	1	Connected	Unknown	Online	31	2026-08-29 17:13:22.4566
3721	1	Connected	Unknown	Online	31	2026-08-29 17:16:22.49193
3726	1	Connected	Unknown	Online	30	2026-08-29 17:18:02.516248
3823	1	Connected	Unknown	Online	77	2026-08-30 13:13:23.927025
3921	1	Connected	Unknown	Online	22	2026-08-30 16:55:53.421568
3967	1	Unknown	Unknown	Online	\N	2026-09-06 13:22:24.688414
4039	1	Connected	Unknown	Online	42	2026-09-06 13:45:48.677783
4040	1	Connected	Unknown	Online	42	2026-09-06 13:46:31.607306
4041	1	Unknown	Unknown	Online	\N	2026-09-06 13:46:33.88891
4043	1	Unknown	Unknown	Online	\N	2026-09-06 13:46:39.715764
4081	1	Connected	Unknown	Online	40	2026-09-06 14:00:01.676292
4082	1	Connected	Unknown	Online	40	2026-09-06 14:00:21.705996
4084	1	Connected	Unknown	Online	40	2026-09-06 14:01:01.703639
4085	1	Connected	Unknown	Online	40	2026-09-06 14:01:21.709572
4128	1	Connected	Unknown	Online	38	2026-09-06 14:15:41.96519
4133	1	Connected	Unknown	Online	37	2026-09-06 14:17:21.983585
4141	1	Connected	Unknown	Online	37	2026-09-06 14:19:07.4796
4144	1	Connected	Unknown	Online	37	2026-09-06 14:20:07.484867
4206	1	Connected	Unknown	Online	33	2026-09-06 14:40:47.820792
4210	1	Connected	Unknown	Online	33	2026-09-06 14:42:07.818077
4261	1	Connected	Unknown	Online	27	2026-09-06 15:02:41.31223
4263	1	Connected	Unknown	Online	27	2026-09-06 15:03:21.337471
4264	1	Connected	Unknown	Online	27	2026-09-06 15:03:41.313433
4265	1	Connected	Unknown	Online	27	2026-09-06 15:04:01.307166
4266	1	Connected	Unknown	Online	27	2026-09-06 15:04:21.356957
4272	1	Connected	Unknown	Online	26	2026-09-06 15:06:21.436966
4275	1	Connected	Unknown	Online	26	2026-09-06 15:07:21.391519
4323	1	Connected	Unknown	Online	23	2026-09-06 15:24:01.326022
4452	1	Connected	Unknown	Online	12	2026-09-06 16:05:11.440049
4453	1	Connected	Unknown	Online	12	2026-09-06 16:05:25.391414
4454	1	Unknown	Unknown	Online	\N	2026-09-06 16:05:25.733652
4456	1	Unknown	Unknown	Online	\N	2026-09-06 16:05:26.056722
4457	1	Connected	Unknown	Online	12	2026-09-06 16:05:45.414952
4458	1	Connected	Unknown	Online	12	2026-09-06 16:06:05.261921
4459	1	Connected	Unknown	Online	12	2026-09-06 16:06:25.219563
4460	1	Connected	Unknown	Online	12	2026-09-06 16:06:45.188563
4462	1	Connected	Unknown	Online	12	2026-09-06 16:07:25.236952
4464	1	Connected	Unknown	Online	12	2026-09-06 16:08:05.403043
4465	1	Connected	Unknown	Online	11	2026-09-06 16:08:25.380395
4684	1	Connected	Unknown	Online	24	2026-09-06 17:21:11.221636
4757	1	Connected	Unknown	Online	29	2026-09-06 17:43:27.788332
4759	1	Connected	Unknown	Online	29	2026-09-06 17:44:07.731911
4806	1	Connected	Unknown	Online	32	2026-09-06 17:57:29.579805
2795	1	Connected	Inactive	Online	79	2026-08-20 12:17:40.410063
2796	1	Disconnected	Inactive	Online	0	2026-08-20 12:17:40.410947
2797	1	Connected	Inactive	Online	79	2026-08-20 12:17:40.411558
2798	1	\N	\N	Online	\N	2026-08-20 12:17:57.414488
2799	1	\N	\N	Online	\N	2026-08-20 12:17:57.460407
2802	1	Connected	Active	Online	79	2026-08-20 12:18:18.957703
2803	1	Connected	Active	Online	79	2026-08-20 12:18:39.104484
2804	1	\N	\N	Online	\N	2026-08-20 12:18:57.388849
2805	1	\N	\N	Online	\N	2026-08-20 12:18:57.427127
3261	1	\N	\N	Online	\N	2026-08-29 14:30:57.937369
3361	1	Connected	Unknown	Online	57	2026-08-29 14:58:41.757955
3366	1	Connected	Unknown	Online	57	2026-08-29 15:00:21.772339
3368	1	Connected	Unknown	Online	56	2026-08-29 15:01:01.777971
3370	1	Connected	Unknown	Online	56	2026-08-29 15:01:41.791758
3445	1	Connected	Unknown	Online	52	2026-08-29 15:26:41.991794
3500	1	Connected	Unknown	Online	46	2026-08-29 15:59:38.259374
3502	1	Connected	Unknown	Online	46	2026-08-29 16:00:18.263433
3503	1	Connected	Unknown	Online	46	2026-08-29 16:00:38.296212
3505	1	Connected	Unknown	Online	46	2026-08-29 16:01:18.284435
3506	1	Connected	Unknown	Online	45	2026-08-29 16:01:38.282972
3507	1	Connected	Unknown	Online	45	2026-08-29 16:01:58.28838
3570	1	Connected	Unknown	Online	42	2026-08-29 16:20:48.530945
3623	1	Connected	Unknown	Online	38	2026-08-29 16:40:52.868909
3624	1	Connected	Active	Online	85	2026-08-29 16:41:04.109096
3626	1	Connected	Unknown	Online	38	2026-08-29 16:41:32.837585
3687	1	Connected	Unknown	Online	33	2026-08-29 17:05:02.373633
3695	1	Connected	Unknown	Online	32	2026-08-29 17:07:42.383973
3702	1	Connected	Unknown	Online	32	2026-08-29 17:10:02.389155
3713	1	Connected	Unknown	Online	31	2026-08-29 17:13:42.460428
3718	1	Connected	Unknown	Online	31	2026-08-29 17:15:22.473575
3722	1	Connected	Unknown	Online	31	2026-08-29 17:16:42.488438
3728	1	Connected	Unknown	Online	30	2026-08-29 17:19:29.875479
3732	1	Connected	Unknown	Online	30	2026-08-29 17:19:50.070274
3734	1	Connected	Unknown	Online	30	2026-08-29 17:20:29.841958
3735	1	Connected	Unknown	Online	30	2026-08-29 17:20:49.836724
3742	1	Connected	Unknown	Online	29	2026-08-29 17:23:11.114093
3743	1	Connected	Unknown	Online	29	2026-08-29 17:23:31.13514
3825	1	Connected	Unknown	Online	77	2026-08-30 13:14:03.887978
3827	1	Connected	Unknown	Online	77	2026-08-30 13:14:43.855584
3828	1	Connected	Unknown	Online	77	2026-08-30 13:15:03.971338
3829	1	Connected	Unknown	Online	77	2026-08-30 13:15:24.034083
3922	1	Connected	Unknown	Online	22	2026-08-30 16:56:13.510931
3970	1	Connected	Unknown	Online	47	2026-09-06 13:23:10.121743
3971	1	Connected	Unknown	Online	46	2026-09-06 13:23:30.217126
3972	1	Connected	Unknown	Online	46	2026-09-06 13:23:50.162337
4044	1	Connected	Unknown	Online	42	2026-09-06 13:46:51.144603
4045	1	Connected	Unknown	Online	42	2026-09-06 13:47:11.139088
4087	1	Connected	Unknown	Online	39	2026-09-06 14:02:01.717544
4095	1	Connected	Unknown	Online	39	2026-09-06 14:04:41.69272
4096	1	Connected	Unknown	Online	39	2026-09-06 14:05:01.728761
4097	1	Connected	Unknown	Online	39	2026-09-06 14:05:21.758576
4098	1	Connected	Unknown	Online	39	2026-09-06 14:05:41.727182
4099	1	Connected	Unknown	Online	39	2026-09-06 14:06:01.796342
4129	1	Connected	Unknown	Online	37	2026-09-06 14:16:01.968782
4208	1	Connected	Unknown	Online	33	2026-09-06 14:41:27.806274
4212	1	Connected	Unknown	Online	32	2026-09-06 14:42:47.853449
4218	1	Connected	Unknown	Online	31	2026-09-06 14:44:47.823472
4219	1	Connected	Unknown	Online	31	2026-09-06 14:45:21.546435
4220	1	Unknown	Unknown	Online	\N	2026-09-06 14:45:22.715269
4267	1	Connected	Unknown	Online	26	2026-09-06 15:04:41.307324
4268	1	Connected	Unknown	Online	26	2026-09-06 15:05:01.30799
4325	1	Connected	Unknown	Online	23	2026-09-06 15:24:41.240895
4466	1	Connected	Unknown	Online	11	2026-09-06 16:11:28.681957
4468	1	Unknown	Unknown	Online	\N	2026-09-06 16:11:29.915005
4472	1	Connected	Unknown	Online	11	2026-09-06 16:12:28.587537
4476	1	Connected	Unknown	Online	12	2026-09-06 16:13:48.659305
4477	1	Connected	Unknown	Online	12	2026-09-06 16:14:08.70558
4478	1	Connected	Unknown	Online	12	2026-09-06 16:14:28.695144
4685	1	Connected	Unknown	Online	24	2026-09-06 17:21:31.187705
4688	1	Connected	Unknown	Online	23	2026-09-06 17:22:31.258752
4691	1	Connected	Unknown	Online	23	2026-09-06 17:23:31.313553
4758	1	Connected	Unknown	Online	29	2026-09-06 17:43:47.708371
4761	1	Connected	Unknown	Online	30	2026-09-06 17:44:47.753334
4807	1	Connected	Unknown	Online	32	2026-09-06 17:57:49.609578
4810	1	Connected	Unknown	Online	32	2026-09-06 17:58:59.544629
2800	1	Connected	Active	Online	79	2026-08-20 12:17:58.901905
2801	1	\N	\N	Online	\N	2026-08-20 12:17:58.967577
2806	1	Connected	Active	Online	79	2026-08-20 12:18:59.060779
2807	1	\N	\N	Online	\N	2026-08-20 12:18:59.073857
2808	1	Connected	Active	Online	79	2026-08-20 12:19:18.971598
2809	1	\N	\N	Online	\N	2026-08-20 12:19:27.396235
2810	1	Connected	Active	Online	79	2026-08-20 12:19:38.971509
3262	1	Connected	Inactive	Online	61	2026-08-29 14:30:58.000152
3266	1	Connected	Active	Online	61	2026-08-29 14:31:37.722788
3267	1	\N	\N	Online	\N	2026-08-29 14:31:57.478482
3270	1	Connected	Active	Online	61	2026-08-29 14:32:17.78393
3271	1	\N	\N	Online	\N	2026-08-29 14:32:27.530064
3362	1	Connected	Unknown	Online	57	2026-08-29 14:59:01.756574
3363	1	Connected	Unknown	Online	57	2026-08-29 14:59:21.75972
3364	1	Connected	Unknown	Online	57	2026-08-29 14:59:41.768163
2819	1	\N	\N	Online	\N	2026-08-20 12:19:57.449073
2820	1	Connected	Active	Online	79	2026-08-20 12:19:59.037163
2821	1	\N	\N	Online	\N	2026-08-20 12:19:59.171112
2822	1	Disconnected	Active	Online	0	2026-08-20 12:20:05.996108
3365	1	Connected	Unknown	Online	57	2026-08-29 15:00:01.768167
3367	1	Connected	Unknown	Online	56	2026-08-29 15:00:41.776939
3447	1	Connected	Active	Online	100	2026-08-29 15:28:47.848602
3510	1	Connected	Unknown	Online	45	2026-08-29 16:02:58.491492
3571	1	Connected	Unknown	Online	41	2026-08-29 16:21:23.927983
3625	1	Connected	Unknown	Online	38	2026-08-29 16:41:12.845785
3629	1	Connected	Unknown	Online	38	2026-08-29 16:42:26.571541
3631	1	\N	\N	Online	\N	2026-08-29 16:42:27.248113
3633	1	Connected	Unknown	Online	37	2026-08-29 16:42:46.539283
3689	1	Connected	Unknown	Online	33	2026-08-29 17:05:42.377451
3697	1	Connected	Unknown	Online	32	2026-08-29 17:08:22.401266
3704	1	Connected	Unknown	Online	32	2026-08-29 17:10:42.4265
3714	1	Connected	Unknown	Online	31	2026-08-29 17:14:02.464613
3723	1	Connected	Unknown	Online	31	2026-08-29 17:17:02.499523
3725	1	Connected	Unknown	Online	31	2026-08-29 17:17:42.536861
3729	1	\N	\N	Online	\N	2026-08-29 17:19:31.277837
3745	1	Connected	Unknown	Online	29	2026-08-29 17:24:11.149491
3831	1	Connected	Unknown	Online	77	2026-08-30 13:16:03.919213
3923	1	Connected	Unknown	Online	23	2026-08-30 16:56:33.431007
3973	1	Connected	Unknown	Online	46	2026-09-06 13:24:10.131128
3974	1	Connected	Unknown	Online	46	2026-09-06 13:24:30.142683
3976	1	Connected	Unknown	Online	46	2026-09-06 13:25:10.146729
3978	1	Connected	Unknown	Online	46	2026-09-06 13:25:50.170035
3979	1	Connected	Unknown	Online	46	2026-09-06 13:26:10.176604
4047	1	Connected	Unknown	Online	42	2026-09-06 13:47:51.138418
4048	1	Connected	Unknown	Online	42	2026-09-06 13:48:11.16736
4089	1	Connected	Unknown	Online	39	2026-09-06 14:02:41.715801
4090	1	Connected	Unknown	Online	39	2026-09-06 14:03:01.723576
4130	1	Connected	Unknown	Online	37	2026-09-06 14:16:21.954865
4211	1	Connected	Unknown	Online	33	2026-09-06 14:42:27.905187
4269	1	Connected	Unknown	Online	26	2026-09-06 15:05:21.340722
4270	1	Connected	Unknown	Online	26	2026-09-06 15:05:41.276322
4326	1	Connected	Unknown	Online	23	2026-09-06 15:25:01.282652
4467	1	Unknown	Unknown	Online	\N	2026-09-06 16:11:29.489764
4470	1	Connected	Unknown	Online	11	2026-09-06 16:11:48.651262
4695	1	Unknown	Unknown	Online	\N	2026-09-06 17:24:33.888819
4697	1	Unknown	Unknown	Online	\N	2026-09-06 17:24:34.105748
4698	1	Connected	Unknown	Online	23	2026-09-06 17:24:51.356803
4700	1	Connected	Unknown	Online	23	2026-09-06 17:25:31.309802
4701	1	Connected	Unknown	Online	23	2026-09-06 17:25:51.323078
4703	1	Connected	Unknown	Online	23	2026-09-06 17:26:31.381344
4762	1	Connected	Unknown	Online	30	2026-09-06 17:45:07.777575
4808	1	Connected	Unknown	Online	32	2026-09-06 17:58:20.36479
3263	1	Disconnected	Active	Online	0	2026-08-29 14:30:58.469353
3264	1	Connected	Active	Online	61	2026-08-29 14:31:17.790979
3265	1	\N	\N	Online	\N	2026-08-29 14:31:27.524152
3272	1	Connected	Active	Online	61	2026-08-29 14:32:37.727283
3273	1	Disconnected	Active	Online	0	2026-08-29 14:32:37.944525
3274	1	Connected	Inactive	Online	61	2026-08-29 14:33:08.385453
3275	1	Connected	Inactive	Online	61	2026-08-29 14:33:08.408072
3369	1	Connected	Unknown	Online	56	2026-08-29 15:01:21.821684
3372	1	Connected	Unknown	Online	56	2026-08-29 15:02:21.819293
3448	1	Connected	Unknown	Online	52	2026-08-29 15:29:02.003974
3511	1	Connected	Unknown	Online	45	2026-08-29 16:03:18.303041
3572	1	Connected	Unknown	Online	41	2026-08-29 16:21:28.535083
3627	1	Connected	Unknown	Online	38	2026-08-29 16:41:52.861856
3630	1	\N	\N	Online	\N	2026-08-29 16:42:27.108518
3691	1	Connected	Unknown	Online	33	2026-08-29 17:06:22.387377
3698	1	Connected	Unknown	Online	32	2026-08-29 17:08:42.407891
3700	1	Connected	Unknown	Online	32	2026-08-29 17:09:22.403185
3701	1	Connected	Unknown	Online	32	2026-08-29 17:09:42.407851
3703	1	Connected	Unknown	Online	32	2026-08-29 17:10:22.421377
3706	1	Connected	Unknown	Online	32	2026-08-29 17:11:22.432971
3716	1	Connected	Unknown	Online	31	2026-08-29 17:14:42.482673
3719	1	Connected	Unknown	Online	31	2026-08-29 17:15:42.479309
3720	1	Connected	Unknown	Online	31	2026-08-29 17:16:02.498284
3724	1	Connected	Unknown	Online	31	2026-08-29 17:17:22.495853
3727	1	Connected	Unknown	Online	30	2026-08-29 17:18:22.512768
3832	1	Connected	Unknown	Online	61	2026-08-30 16:26:07.665851
3833	1	Unknown	Unknown	Online	\N	2026-08-30 16:26:08.113695
3924	1	Connected	Unknown	Online	23	2026-08-30 16:56:53.477388
3981	1	Connected	Unknown	Online	46	2026-09-06 13:26:50.285545
4051	1	Connected	Unknown	Online	42	2026-09-06 13:51:06.850385
4091	1	Connected	Unknown	Online	39	2026-09-06 14:03:21.727771
4093	1	Connected	Unknown	Online	39	2026-09-06 14:04:01.792595
4094	1	Connected	Unknown	Online	39	2026-09-06 14:04:21.736749
4131	1	Connected	Unknown	Online	37	2026-09-06 14:16:41.965153
4213	1	Connected	Unknown	Online	32	2026-09-06 14:43:07.81983
4215	1	Connected	Unknown	Online	32	2026-09-06 14:43:47.835413
4217	1	Connected	Unknown	Online	31	2026-09-06 14:44:27.847965
4221	1	Unknown	Unknown	Online	\N	2026-09-06 14:45:24.744398
4271	1	Connected	Unknown	Online	26	2026-09-06 15:06:01.357315
4273	1	Connected	Unknown	Online	26	2026-09-06 15:06:41.393195
4274	1	Connected	Unknown	Online	26	2026-09-06 15:07:01.399835
4276	1	Connected	Unknown	Online	26	2026-09-06 15:07:41.3859
4327	1	Connected	Unknown	Online	23	2026-09-06 15:25:21.350633
4469	1	Unknown	Unknown	Online	\N	2026-09-06 16:11:29.936435
4479	1	Connected	Unknown	Online	13	2026-09-06 16:14:48.662921
4704	1	Connected	Unknown	Online	23	2026-09-06 17:26:51.38347
4705	1	Connected	Unknown	Online	23	2026-09-06 17:27:11.365085
4706	1	Connected	Unknown	Online	23	2026-09-06 17:27:31.475834
4707	1	Connected	Unknown	Online	22	2026-09-06 17:27:51.491385
4711	1	Connected	Unknown	Online	22	2026-09-06 17:29:07.294724
4763	1	Connected	Unknown	Online	30	2026-09-06 17:45:27.790121
4764	1	Connected	Unknown	Online	30	2026-09-06 17:45:47.903392
4768	1	Connected	Unknown	Online	31	2026-09-06 17:46:59.685666
4769	1	Unknown	Unknown	Online	\N	2026-09-06 17:47:00.361351
4811	1	Connected	Unknown	Online	32	2026-09-06 17:59:19.519481
4816	1	Connected	Unknown	Online	32	2026-09-06 18:02:30.764774
3268	1	Connected	Active	Online	61	2026-08-29 14:31:57.705811
3269	1	\N	\N	Online	\N	2026-08-29 14:31:57.796898
3371	1	Connected	Unknown	Online	56	2026-08-29 15:02:01.796926
3376	1	Connected	Unknown	Online	56	2026-08-29 15:03:41.809772
3449	1	Connected	Unknown	Online	51	2026-08-29 15:30:02.032383
3512	1	Connected	Unknown	Online	45	2026-08-29 16:03:38.524437
3573	1	Connected	Unknown	Online	41	2026-08-29 16:21:48.622272
3628	1	Connected	Unknown	Online	38	2026-08-29 16:42:12.873196
3632	1	\N	\N	Online	\N	2026-08-29 16:42:27.343419
3693	1	Connected	Unknown	Online	32	2026-08-29 17:07:02.390869
3694	1	Connected	Unknown	Online	32	2026-08-29 17:07:22.391749
3696	1	Connected	Unknown	Online	32	2026-08-29 17:08:02.400341
3705	1	Connected	Unknown	Online	32	2026-08-29 17:11:02.415612
3709	1	Connected	Unknown	Online	32	2026-08-29 17:12:22.447531
3710	1	Connected	Unknown	Online	32	2026-08-29 17:12:42.472064
3715	1	Connected	Unknown	Online	31	2026-08-29 17:14:22.521249
3717	1	Connected	Unknown	Online	31	2026-08-29 17:15:02.487895
3834	1	Unknown	Unknown	Online	\N	2026-08-30 16:26:10.017295
3925	1	Connected	Unknown	Online	23	2026-08-30 16:57:13.436634
3982	1	Connected	Unknown	Online	46	2026-09-06 13:27:10.274946
3984	1	Connected	Unknown	Online	46	2026-09-06 13:27:50.181246
4052	1	Connected	Unknown	Online	42	2026-09-06 13:51:11.170344
4092	1	Connected	Unknown	Online	39	2026-09-06 14:03:41.877871
4132	1	Connected	Unknown	Online	37	2026-09-06 14:17:01.944311
4214	1	Connected	Unknown	Online	32	2026-09-06 14:43:27.827216
4216	1	Connected	Unknown	Online	32	2026-09-06 14:44:07.80909
4277	1	Connected	Unknown	Online	26	2026-09-06 15:08:01.406961
4328	1	Connected	Unknown	Online	23	2026-09-06 15:25:41.320209
4471	1	Connected	Unknown	Online	11	2026-09-06 16:12:08.584953
4473	1	Connected	Unknown	Online	11	2026-09-06 16:12:48.64069
4475	1	Connected	Unknown	Online	12	2026-09-06 16:13:28.669399
4480	1	Connected	Unknown	Online	13	2026-09-06 16:15:08.676732
4481	1	Connected	Unknown	Online	13	2026-09-06 16:15:28.757349
4708	1	Connected	Unknown	Online	22	2026-09-06 17:28:11.404853
4709	1	Connected	Unknown	Online	22	2026-09-06 17:28:31.485175
4710	1	Connected	Unknown	Online	22	2026-09-06 17:28:51.568597
4715	1	Connected	Unknown	Online	22	2026-09-06 17:29:26.95444
4716	1	Connected	Unknown	Online	22	2026-09-06 17:29:46.941454
4718	1	Connected	Unknown	Online	22	2026-09-06 17:30:26.992557
4719	1	Connected	Unknown	Online	23	2026-09-06 17:30:47.01467
4765	1	Connected	Unknown	Online	30	2026-09-06 17:46:08.32031
4774	1	Connected	Unknown	Online	31	2026-09-06 17:47:59.296911
4783	1	Connected	Unknown	Online	31	2026-09-06 17:49:49.26737
4812	1	Connected	Unknown	Online	32	2026-09-06 17:59:39.561327
4814	1	Connected	Unknown	Online	32	2026-09-06 18:00:19.587911
4815	1	Connected	Unknown	Online	32	2026-09-06 18:00:39.557744
4818	1	Connected	Unknown	Online	32	2026-09-06 18:03:10.789959
4822	1	Connected	Unknown	Online	33	2026-09-06 18:04:30.81135
4824	1	Unknown	Unknown	Online	\N	2026-09-06 18:04:47.560593
3276	1	\N	\N	Online	\N	2026-08-29 14:33:08.459992
3277	1	\N	\N	Online	\N	2026-08-29 14:33:08.460679
3373	1	Connected	Unknown	Online	56	2026-08-29 15:02:41.786744
3374	1	Connected	Unknown	Online	56	2026-08-29 15:03:01.803566
3375	1	Connected	Unknown	Online	56	2026-08-29 15:03:21.82444
3378	1	Connected	Unknown	Online	56	2026-08-29 15:04:21.822825
3381	1	Connected	Unknown	Online	56	2026-08-29 15:05:21.84034
3382	1	Connected	Unknown	Online	56	2026-08-29 15:05:41.832694
3383	1	Connected	Unknown	Online	56	2026-08-29 15:06:01.851182
3385	1	Connected	Unknown	Online	55	2026-08-29 15:06:41.848657
3386	1	Connected	Unknown	Online	55	2026-08-29 15:07:01.84949
3387	1	Connected	Unknown	Online	55	2026-08-29 15:07:21.849479
3392	1	Connected	Unknown	Online	55	2026-08-29 15:09:01.874843
3393	1	Connected	Unknown	Online	55	2026-08-29 15:09:21.885307
3450	1	Connected	Unknown	Online	51	2026-08-29 15:30:22.027231
3513	1	\N	\N	Online	\N	2026-08-29 16:03:39.028759
3574	1	Connected	Unknown	Online	41	2026-08-29 16:22:08.62302
3577	1	Connected	Unknown	Online	41	2026-08-29 16:23:08.587209
3578	1	Connected	Unknown	Online	41	2026-08-29 16:23:28.563227
3634	1	Connected	Unknown	Online	37	2026-08-29 16:43:06.541521
3730	1	\N	\N	Online	\N	2026-08-29 17:19:31.503296
3736	1	Connected	Unknown	Online	30	2026-08-29 17:21:09.839336
3741	1	Connected	Unknown	Online	29	2026-08-29 17:22:51.113524
3750	1	Connected	Unknown	Online	29	2026-08-29 17:25:51.148743
3752	1	Connected	Unknown	Online	29	2026-08-29 17:26:31.136371
3755	1	Connected	Unknown	Online	28	2026-08-29 17:27:31.169739
3835	1	Unknown	Unknown	Online	\N	2026-08-30 16:26:10.031254
3926	1	Connected	Unknown	Online	23	2026-08-30 16:57:33.512124
3932	1	Connected	Unknown	Online	25	2026-08-30 16:59:33.590555
3983	1	Connected	Unknown	Online	46	2026-09-06 13:27:30.1888
4053	1	Connected	Unknown	Online	42	2026-09-06 13:51:31.237901
4100	1	Connected	Unknown	Online	39	2026-09-06 14:06:21.816032
4134	1	Connected	Unknown	Online	37	2026-09-06 14:17:41.990807
4135	1	Connected	Unknown	Online	37	2026-09-06 14:18:08.149309
4139	1	Connected	Unknown	Online	37	2026-09-06 14:18:27.561933
4222	1	Connected	Unknown	Online	31	2026-09-06 14:45:41.004948
4223	1	Unknown	Unknown	Online	\N	2026-09-06 14:45:41.725043
4278	1	Connected	Unknown	Online	26	2026-09-06 15:08:21.685706
4329	1	Connected	Unknown	Online	23	2026-09-06 15:26:01.352273
4474	1	Connected	Unknown	Online	12	2026-09-06 16:13:08.617391
4712	1	Unknown	Unknown	Online	\N	2026-09-06 17:29:08.096148
4766	1	Connected	Unknown	Online	30	2026-09-06 17:46:27.8313
4813	1	Connected	Unknown	Online	32	2026-09-06 17:59:59.544797
3278	1	Disconnected	Active	Online	0	2026-08-29 14:33:08.529168
3284	1	\N	\N	Online	\N	2026-08-29 14:34:08.247393
3377	1	Connected	Unknown	Online	56	2026-08-29 15:04:01.819432
3451	1	Connected	Unknown	Online	51	2026-08-29 15:31:22.040918
3514	1	Connected	Unknown	Online	45	2026-08-29 16:03:58.383796
3515	1	Connected	Unknown	Online	45	2026-08-29 16:04:09.98344
3516	1	\N	\N	Online	\N	2026-08-29 16:04:10.10201
3517	1	\N	\N	Online	\N	2026-08-29 16:04:10.386215
3519	1	Connected	Unknown	Online	45	2026-08-29 16:04:14.113123
3521	1	\N	\N	Online	\N	2026-08-29 16:04:14.330296
3523	1	Connected	Unknown	Online	45	2026-08-29 16:04:34.072533
3526	1	Connected	Unknown	Online	45	2026-08-29 16:05:34.102818
3531	1	Connected	Unknown	Online	44	2026-08-29 16:07:14.132548
3535	1	Connected	Unknown	Online	44	2026-08-29 16:08:34.142799
3540	1	Connected	Unknown	Online	44	2026-08-29 16:10:19.013408
3541	1	Connected	Unknown	Online	44	2026-08-29 16:10:39.015639
3542	1	Connected	Unknown	Online	44	2026-08-29 16:10:59.01952
3575	1	Connected	Unknown	Online	41	2026-08-29 16:22:28.559874
3635	1	Connected	Unknown	Online	37	2026-08-29 16:43:26.555595
3637	1	Connected	Unknown	Online	37	2026-08-29 16:44:06.543866
3731	1	\N	\N	Online	\N	2026-08-29 17:19:31.76957
3733	1	Connected	Unknown	Online	30	2026-08-29 17:20:09.82783
3738	1	Connected	Unknown	Online	30	2026-08-29 17:21:50.788188
3740	1	Connected	Unknown	Online	29	2026-08-29 17:22:31.355236
3744	1	Connected	Unknown	Online	29	2026-08-29 17:23:51.136166
3746	1	Connected	Unknown	Online	29	2026-08-29 17:24:31.135208
3747	1	Connected	Unknown	Online	29	2026-08-29 17:24:51.128722
3836	1	Connected	Unknown	Online	61	2026-08-30 16:26:27.413277
3927	1	Connected	Unknown	Online	24	2026-08-30 16:57:53.495997
3985	1	Connected	Unknown	Online	46	2026-09-06 13:28:10.30059
4054	1	Connected	Unknown	Online	42	2026-09-06 13:51:51.192297
4101	1	Connected	Unknown	Online	39	2026-09-06 14:06:41.883813
4136	1	Unknown	Unknown	Online	\N	2026-09-06 14:18:10.690717
4138	1	Unknown	Unknown	Online	\N	2026-09-06 14:18:11.101198
4224	1	Connected	Unknown	Online	31	2026-09-06 14:46:00.969341
4279	1	Connected	Unknown	Online	26	2026-09-06 15:08:41.552466
4280	1	Connected	Unknown	Online	26	2026-09-06 15:09:01.377592
4281	1	Connected	Unknown	Online	26	2026-09-06 15:09:21.395279
4282	1	Connected	Unknown	Online	26	2026-09-06 15:09:41.492885
4330	1	Connected	Unknown	Online	23	2026-09-06 15:26:21.303176
4482	1	Connected	Unknown	Online	13	2026-09-06 16:15:48.727079
4484	1	Connected	Unknown	Online	14	2026-09-06 16:16:28.857806
4713	1	Unknown	Unknown	Online	\N	2026-09-06 17:29:08.845444
4714	1	Unknown	Unknown	Online	\N	2026-09-06 17:29:08.893504
4767	1	Connected	Unknown	Online	31	2026-09-06 17:46:47.811236
4817	1	Connected	Unknown	Online	32	2026-09-06 18:02:50.754884
4820	1	Connected	Unknown	Online	32	2026-09-06 18:03:50.808025
3103	1	Connected	Unknown	Online	38	2026-08-20 14:26:06.632751
3104	1	\N	\N	Online	\N	2026-08-20 14:26:06.754703
3105	1	\N	\N	Online	\N	2026-08-20 14:26:10.263192
3106	1	\N	\N	Online	\N	2026-08-20 14:26:10.293379
3107	1	Connected	Active	Online	38	2026-08-20 14:26:26.138417
3108	1	Connected	Active	Online	38	2026-08-20 14:26:46.155717
3109	1	\N	\N	Online	\N	2026-08-20 14:26:55.897591
3110	1	Connected	Unknown	Online	38	2026-08-20 14:26:55.910263
3111	1	\N	\N	Online	\N	2026-08-20 14:26:55.927303
3112	1	\N	\N	Online	\N	2026-08-20 14:26:56.110224
3113	1	Connected	Active	Online	37	2026-08-20 14:27:15.843082
3114	1	Connected	Active	Online	37	2026-08-20 14:27:35.985012
3115	1	Connected	Active	Online	37	2026-08-20 14:27:55.919063
3116	1	\N	\N	Online	\N	2026-08-20 14:27:55.919575
3117	1	Connected	Active	Online	37	2026-08-20 14:28:15.959426
3118	1	Connected	Active	Online	36	2026-08-20 14:28:35.853659
3119	1	Connected	Active	Online	36	2026-08-20 14:28:55.811682
3120	1	\N	\N	Online	\N	2026-08-20 14:28:55.816597
3121	1	Connected	Active	Online	36	2026-08-20 14:29:15.826904
3122	1	Connected	Active	Online	36	2026-08-20 14:29:35.845022
3123	1	\N	\N	Online	\N	2026-08-20 14:29:56.123033
3124	1	Connected	Active	Online	35	2026-08-20 14:29:56.1245
3125	1	Connected	Active	Online	35	2026-08-20 14:30:15.871546
3126	1	Connected	Active	Online	35	2026-08-20 14:30:36.717861
3127	1	Connected	Active	Online	35	2026-08-20 14:30:55.78985
3128	1	\N	\N	Online	\N	2026-08-20 14:30:55.791101
3129	1	Connected	Active	Online	34	2026-08-20 14:31:15.774276
3130	1	Connected	Active	Online	34	2026-08-20 14:31:36.635833
3131	1	\N	\N	Online	\N	2026-08-20 14:31:59.215251
3132	1	Connected	Active	Online	34	2026-08-20 14:31:59.257842
3133	1	Connected	Active	Online	34	2026-08-20 14:32:17.80002
3134	1	Connected	Active	Online	34	2026-08-20 14:32:39.932122
3135	1	\N	\N	Online	\N	2026-08-20 14:32:56.656312
3136	1	Connected	Active	Online	34	2026-08-20 14:32:56.67841
3137	1	Connected	Active	Online	34	2026-08-20 14:33:19.762578
3138	1	\N	\N	Online	\N	2026-08-20 14:34:28.087636
3139	1	\N	\N	Online	\N	2026-08-20 14:34:28.134774
3140	1	\N	\N	Online	\N	2026-08-20 14:34:31.353835
3141	1	\N	\N	Online	\N	2026-08-20 14:34:31.36748
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.devices (id, adsd_id, serial_number, device_name, vehicle_type, vehicle_number, installation_date, status, last_seen, heartbeat_at, last_ad_id, latitude, longitude, gps_status, internet_status, battery_level, created_at, updated_at, total_distance_km, today_distance_km, last_distance_update, location_updated_at, area, installer_id) FROM stdin;
1	krish-001	1020	Auto	Auto	GJ02323	2026-08-01	Offline	2026-09-06 18:12:11.148646	2026-09-06 18:12:11.148646	\N	23.03244200	72.54913530	Unknown	Connected	33	2026-08-01 16:14:34.832595	2026-09-11 22:49:38.255389	0.79	0.00	2026-08-30	2026-08-30 12:55:27.591	Gulbai tekra	\N
\.


--
-- Data for Name: driver_daily_stats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_daily_stats (id, driver_id, date, distance_km, active_minutes, income, ads_played, created_at, updated_at) FROM stdin;
1983	2	2026-08-15	0.27	112.47	28.35	0	2026-08-15 11:10:56.037725	2026-08-15 16:14:28.519324
1	1	2026-08-01	0.27	0.93	1.31	0	2026-08-01 16:51:13.974522	2026-08-01 16:52:09.545618
2490	2	2026-08-20	3.44	110.94	40.91	0	2026-08-20 11:25:12.425259	2026-08-20 14:05:41.683866
739	1	2026-08-07	0.00	33.10	8.28	0	2026-08-07 23:24:40.934578	2026-08-07 23:59:54.485284
3766	1	2026-08-30	0.01	20.50	5.00	0	2026-08-30 12:55:23.895288	2026-08-30 13:16:03.917684
3179	1	2026-08-26	0.04	12.75	3.29	0	2026-08-26 15:26:45.279441	2026-08-26 18:05:17.214693
1129	2	2026-08-08	0.22	161.22	40.41	0	2026-08-08 00:39:20.340623	2026-08-08 17:23:04.296795
429	1	2026-08-03	0.08	14.61	3.92	0	2026-08-03 17:05:12.086379	2026-08-03 17:19:57.927611
3142	2	2026-08-23	0.33	5.14	2.50	0	2026-08-23 23:54:25.603322	2026-08-23 23:59:25.96122
629	2	2026-08-07	0.18	30.69	8.18	0	2026-08-07 22:09:02.49213	2026-08-07 23:23:08.927836
499	2	2026-08-03	0.05	21.64	5.55	0	2026-08-03 17:18:30.472962	2026-08-03 17:39:35.666683
106	2	2026-08-02	0.00	45.16	11.04	0	2026-08-02 00:39:15.873655	2026-08-02 01:29:06.676098
3172	2	2026-08-24	0.08	0.10	0.33	0	2026-08-24 00:59:58.935544	2026-08-24 01:00:05.399936
1914	1	2026-08-09	0.21	15.71	4.74	0	2026-08-09 18:31:12.184313	2026-08-09 18:46:55.130998
5	1	2026-08-02	0.18	22.72	6.21	0	2026-08-02 00:23:12.366481	2026-08-02 01:31:08.693713
2795	1	2026-08-20	0.00	12.64	3.12	0	2026-08-20 12:17:40.38638	2026-08-20 14:34:31.364089
933	1	2026-08-08	0.00	55.99	13.66	0	2026-08-08 00:00:09.631485	2026-08-08 01:03:25.597886
3225	1	2026-08-29	0.00	154.13	37.64	0	2026-08-29 14:25:30.401047	2026-08-29 17:29:47.445594
\.


--
-- Data for Name: driver_payment_methods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_payment_methods (id, driver_id, account_holder, account_number, ifsc, bank_name, branch, is_primary, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: driver_wallet; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_wallet (id, driver_id, balance, distance_accumulator, last_lat, last_lon, last_update_time, created_at, updated_at) FROM stdin;
1	2	0.00	0.0000	23.03270340	72.55217110	2026-08-20 14:32:59.971	2026-08-07 23:06:32.174801	2026-08-07 23:06:32.174801
\.


--
-- Data for Name: driver_wallet_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.driver_wallet_transactions (id, driver_id, amount, type, reason, distance_earned, created_at) FROM stdin;
\.


--
-- Data for Name: drivers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.drivers (id, name, phone, password_hash, vehicle_type, vehicle_number, status, device_id, created_at, email, profile_photo, updated_at) FROM stdin;
1	Krish	7845213652	$2a$10$MMCBubuS9XTq4Q1PwUYkju7BQksR1lLPwj1lit1N2iF.2t4EyTedm	Auto	GJ012323	Active	1	2026-08-01 16:13:52.430362	\N	\N	2026-08-07 23:13:15.96131
2	Suraj Mehata	1234567893	$2a$10$6jUHnbCsMwgdNcE0ZoSk1eVzm5gdnCqx2fS04LUogjSqcCnKl7Yeu	Auto	GJ012222	Active	\N	2026-08-02 00:39:00.895635	suraj12@gmail.com	\N	2026-08-07 23:15:37.093079
\.


--
-- Data for Name: installers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.installers (id, name, phone, email, status, created_at) FROM stdin;
\.


--
-- Data for Name: media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.media (id, title, file_name, file_url, media_type, duration, resolution, size, uploaded_by, created_at, advertiser_id, thumbnail_url) FROM stdin;
17	Ghh	1788683121268-508611306.jpg	/uploads/1788683121268-508611306.jpg	image	15	\N	205314	\N	2026-09-06 13:55:21.549616	\N	\N
20	SRAds Default Media	srads_default.png	/uploads/default_srads.png	image	15	\N	\N	\N	2026-09-06 14:08:44.981606	3	\N
21	Test 	1788683998635-618194254.jpg	/uploads/1788683998635-618194254.jpg	image	15	\N	142257	\N	2026-09-06 14:09:58.707409	\N	\N
22	Test vid 	1788693242611-946917311.mp4	/uploads/1788693242611-946917311.mp4	video	15	\N	21330403	\N	2026-09-06 16:44:21.622057	\N	\N
23	Test vid	1788693601032-102868081.mp4	/uploads/1788693601032-102868081.mp4	video	15	\N	21330403	\N	2026-09-06 16:50:18.48059	\N	\N
24	Test	1788697572374-221529819.jpeg	/uploads/1788697572374-221529819.jpeg	image	15	\N	635580	\N	2026-09-06 17:56:12.744952	\N	\N
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, title, message, type, status, created_at) FROM stdin;
\.


--
-- Data for Name: playback_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.playback_logs (id, device_id, campaign_id, ad_id, played_at, duration, playback_session_id, amount, rate_per_second, advertiser_id) FROM stdin;
1879	1	\N	22	2026-09-06 17:56:49.61135	99	pb_22_1788697508634_c35aao	34.65	0.20	\N
1642	1	\N	\N	2026-08-29 17:27:59.72	15	pb_14_1788004664706_83a6ml	0.30	0.02	4
1646	1	\N	\N	2026-08-29 17:28:51.22	15	pb_14_1788004716214_46f70i	0.30	0.02	4
1417	1	\N	\N	2026-08-29 16:17:29.739	26	pb_13_1788000423273_nw657g	5.20	0.20	4
1483	1	\N	\N	2026-08-29 16:36:42.167	26	pb_13_1788001575715_yzvh0f	5.20	0.20	4
1498	1	\N	\N	2026-08-29 16:40:59.48	26	pb_13_1788001833026_0lw1sp	5.20	0.20	4
1501	1	\N	\N	2026-08-29 16:41:50.947	26	pb_13_1788001884499_u4plsp	5.20	0.20	4
1530	1	\N	\N	2026-08-29 16:53:30.246	26	pb_13_1788002583804_suks9w	0.52	0.02	4
1542	1	\N	\N	2026-08-29 16:57:08.991	26	pb_13_1788002802551_giqqgi	0.52	0.02	4
1576	1	\N	\N	2026-08-29 17:07:28.875	26	pb_13_1788003422403_wla9az	0.52	0.02	4
1580	1	\N	\N	2026-08-29 17:08:41.807	26	pb_13_1788003495358_n7yyde	0.52	0.02	4
1588	1	\N	\N	2026-08-29 17:11:07.683	26	pb_13_1788003641223_gyd80g	0.52	0.02	4
1592	1	\N	\N	2026-08-29 17:12:20.624	26	pb_13_1788003714152_olmmwa	0.52	0.02	4
1600	1	\N	\N	2026-08-29 17:14:46.485	26	pb_13_1788003860026_vek5oy	0.52	0.02	4
1645	1	\N	\N	2026-08-29 17:28:36.212	26	pb_13_1788004689740_1d962z	0.52	0.02	4
1288	1	\N	\N	2026-08-29 15:47:41.823	15	\N	0.00	0.20	\N
1291	1	\N	\N	2026-08-29 15:47:41.823	15	\N	0.00	0.20	\N
1294	1	\N	\N	2026-08-29 15:48:33.275	15	\N	0.00	0.20	\N
1297	1	\N	\N	2026-08-29 15:48:33.275	15	\N	0.00	0.20	\N
1300	1	\N	\N	2026-08-29 15:49:24.74	15	\N	0.00	0.20	\N
1303	1	\N	\N	2026-08-29 15:49:24.74	15	\N	0.00	0.20	\N
1304	1	\N	\N	2026-08-29 15:54:24.082	15	\N	0.00	0.20	\N
1510	1	\N	\N	2026-08-29 16:43:56.69	26	pb_13_1788002010245_sxyi62	0.52	0.02	4
1513	1	\N	\N	2026-08-29 16:44:48.162	26	pb_13_1788002061711_w2l6nz	0.52	0.02	4
1614	1	\N	\N	2026-08-29 17:20:20.035	26	pb_13_1788004193561_xwysl0	0.52	0.02	4
1617	1	\N	\N	2026-08-29 17:21:11.503	26	pb_13_1788004245060_2r66nr	0.52	0.02	4
1621	1	\N	\N	2026-08-29 17:22:04.153	26	pb_13_1788004297687_3231vk	0.52	0.02	4
1624	1	\N	\N	2026-08-29 17:23:04.481	26	pb_13_1788004358032_ti4zor	0.52	0.02	4
1415	1	\N	\N	2026-08-29 16:16:48.263	10	pb_12_1788000398258_m0q2fa	2.00	0.20	4
1418	1	\N	\N	2026-08-29 16:17:39.745	10	pb_12_1788000449740_0wu6qi	2.00	0.20	4
1433	1	\N	\N	2026-08-29 16:21:57.089	10	pb_12_1788000707077_2c8vkf	2.00	0.20	4
1469	1	\N	\N	2026-08-29 16:32:14.772	10	pb_12_1788001324764_is1iy4	2.00	0.20	4
1499	1	\N	\N	2026-08-29 16:41:09.49	10	pb_12_1788001859480_2qxim9	2.00	0.20	4
1502	1	\N	\N	2026-08-29 16:42:00.955	10	pb_12_1788001910947_d669gz	2.00	0.20	4
1527	1	\N	\N	2026-08-29 16:52:27.342	10	pb_12_1788002537334_kzch8f	0.20	0.02	4
1535	1	\N	\N	2026-08-29 16:54:53.174	10	pb_12_1788002683162_i0k8ag	0.20	0.02	4
1555	1	\N	\N	2026-08-29 17:00:57.767	10	pb_12_1788003047760_mat3kh	0.20	0.02	4
1591	1	\N	\N	2026-08-29 17:11:54.152	10	pb_12_1788003704140_iepydr	0.20	0.02	4
1597	1	\N	\N	2026-08-29 17:13:43.57	10	pb_12_1788003813562_w31t5b	0.20	0.02	4
1599	1	\N	\N	2026-08-29 17:14:20.026	10	pb_12_1788003850018_ye1hsp	0.20	0.02	4
1204	1	\N	\N	2026-08-29 15:42:47.137916	15	\N	0.00	0.20	\N
1416	1	\N	\N	2026-08-29 16:17:03.272	15	pb_10_1788000408264_s1uymo	3.00	0.20	4
1419	1	\N	\N	2026-08-29 16:17:54.754	15	pb_10_1788000459745_11o4m5	3.00	0.20	4
1431	1	\N	\N	2026-08-29 16:21:20.622	15	pb_10_1788000665616_utazh6	3.00	0.20	4
1434	1	\N	\N	2026-08-29 16:22:12.098	15	pb_10_1788000717089_fs0w9p	3.00	0.20	4
1473	1	\N	\N	2026-08-29 16:33:41.325	15	pb_10_1788001406318_gqnztx	3.00	0.20	4
1503	1	\N	\N	2026-08-29 16:42:15.964	15	pb_10_1788001920956_rpmkls	3.00	0.20	4
75	1	\N	\N	2026-08-02 01:30:15.507278	15	\N	0.00	0.20	\N
77	1	\N	\N	2026-08-02 01:30:35.891834	15	\N	0.00	0.20	\N
79	1	\N	\N	2026-08-02 01:30:56.142462	15	\N	0.00	0.20	\N
81	1	\N	\N	2026-08-03 17:11:11.452082	15	\N	0.00	0.20	\N
1880	1	\N	22	2026-09-06 17:59:40.174264	171	pb_22_1788697608071_m61icb	59.85	0.20	\N
1850	1	\N	22	2026-09-06 17:29:08.773754	1	pb_22_1788695946872_j7fflo	0.35	0.20	\N
1864	1	\N	22	2026-09-06 17:44:03.837342	99	pb_22_1788696743231_r4hqpl	34.65	0.20	\N
1677	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1678	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1679	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1680	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1681	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1682	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1683	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1684	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1685	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1205	1	\N	\N	2026-08-29 15:35:06.223	15	\N	0.00	0.20	\N
1208	1	\N	\N	2026-08-29 15:35:07.985	15	\N	0.00	0.20	\N
1209	1	\N	\N	2026-08-29 15:35:08.524	15	\N	0.00	0.20	\N
1210	1	\N	\N	2026-08-29 15:35:08.524	15	\N	0.00	0.20	\N
1223	1	\N	\N	2026-08-29 15:36:51.447	15	\N	0.00	0.20	\N
1228	1	\N	\N	2026-08-29 15:39:07.124	15	\N	0.00	0.20	\N
1231	1	\N	\N	2026-08-29 15:39:07.124	15	\N	0.00	0.20	\N
1306	1	\N	\N	2026-08-29 15:54:24.082	15	\N	0.00	0.20	\N
1311	1	\N	\N	2026-08-29 15:55:15.549	15	\N	0.00	0.20	\N
1312	1	\N	\N	2026-08-29 15:55:15.549	15	\N	0.00	0.20	\N
1423	1	\N	\N	2026-08-29 16:19:12.687	26	pb_13_1788000526240_wxhydi	5.20	0.20	4
1429	1	\N	\N	2026-08-29 16:20:55.608	26	pb_13_1788000629166_n9y9mg	5.20	0.20	4
1435	1	\N	\N	2026-08-29 16:22:38.545	26	pb_13_1788000732099_dys21a	5.20	0.20	4
1438	1	\N	\N	2026-08-29 16:23:30.011	26	pb_13_1788000783563_v4z9hs	5.20	0.20	4
1462	1	\N	\N	2026-08-29 16:30:21.825	26	pb_13_1788001195362_ayxfk4	5.20	0.20	4
1471	1	\N	\N	2026-08-29 16:33:16.306	27	pb_13_1788001369608_3b0q1q	5.40	0.20	4
1566	1	\N	\N	2026-08-29 17:04:26.548	26	pb_13_1788003240107_s172z2	0.52	0.02	4
1570	1	\N	\N	2026-08-29 17:05:39.467	26	pb_13_1788003313019_2vud1v	0.52	0.02	4
1582	1	\N	\N	2026-08-29 17:09:18.265	26	pb_13_1788003531822_kpfc76	0.52	0.02	4
1586	1	\N	\N	2026-08-29 17:10:31.209	26	pb_13_1788003604758_atwtm2	0.52	0.02	4
1590	1	\N	\N	2026-08-29 17:11:44.14	26	pb_13_1788003677696_ptrfy5	0.52	0.02	4
1648	1	\N	\N	2026-08-29 17:29:27.672	26	pb_13_1788004741231_mcdwn9	0.52	0.02	4
1601	1	\N	\N	2026-08-29 17:14:56.498	10	pb_12_1788003886486_abx39i	0.20	0.02	4
1611	1	\N	\N	2026-08-29 17:17:58.812	10	pb_12_1788004068802_sk05a2	0.20	0.02	4
1213	1	\N	\N	2026-08-29 15:35:49.981	10	\N	0.00	0.20	\N
1214	1	\N	\N	2026-08-29 15:35:49.981	10	\N	0.00	0.20	\N
1226	1	\N	\N	2026-08-29 15:38:57.116	10	\N	0.00	0.20	\N
1229	1	\N	\N	2026-08-29 15:38:57.116	10	\N	0.00	0.20	\N
1232	1	\N	\N	2026-08-29 15:39:48.582	10	\N	0.00	0.20	\N
1305	1	\N	\N	2026-08-29 15:54:14.071	10	\N	0.00	0.20	\N
1309	1	\N	\N	2026-08-29 15:55:05.54	10	\N	0.00	0.20	\N
1310	1	\N	\N	2026-08-29 15:55:05.54	10	\N	0.00	0.20	\N
1421	1	\N	\N	2026-08-29 16:18:31.226	10	pb_12_1788000501218_kpo84y	2.00	0.20	4
1436	1	\N	\N	2026-08-29 16:22:48.554	10	pb_12_1788000758545_atyoqj	2.00	0.20	4
1533	1	\N	\N	2026-08-29 16:54:16.717	10	pb_12_1788002646710_cby871	0.20	0.02	4
1559	1	\N	\N	2026-08-29 17:02:10.696	10	pb_12_1788003120685_q6807s	0.20	0.02	4
1565	1	\N	\N	2026-08-29 17:04:00.106	10	pb_12_1788003230088_ht8lqu	0.20	0.02	4
1583	1	\N	\N	2026-08-29 17:09:28.277	10	pb_12_1788003558266_r2st5q	0.20	0.02	4
1643	1	\N	\N	2026-08-29 17:28:09.738	10	pb_12_1788004679722_4vgihu	0.20	0.02	4
1577	1	\N	\N	2026-08-29 17:07:38.892	10	pb_12_1788003448875_xk5npb	0.20	0.02	4
1579	1	\N	\N	2026-08-29 17:08:15.357	10	pb_12_1788003485345_2qgwqr	0.20	0.02	4
1211	1	\N	\N	2026-08-29 15:35:34.977	15	\N	0.00	0.20	\N
1212	1	\N	\N	2026-08-29 15:35:34.977	15	\N	0.00	0.20	\N
1219	1	\N	\N	2026-08-29 15:36:26.429	15	\N	0.00	0.20	\N
1222	1	\N	\N	2026-08-29 15:37:17.912	15	\N	0.00	0.20	\N
1224	1	\N	\N	2026-08-29 15:38:42.109	15	\N	0.00	0.20	\N
1227	1	\N	\N	2026-08-29 15:38:42.109	15	\N	0.00	0.20	\N
1230	1	\N	\N	2026-08-29 15:39:33.573	15	\N	0.00	0.20	\N
1307	1	\N	\N	2026-08-29 15:54:50.532	15	\N	0.00	0.20	\N
1308	1	\N	\N	2026-08-29 15:54:50.532	15	\N	0.00	0.20	\N
1422	1	\N	\N	2026-08-29 16:18:46.24	15	pb_10_1788000511227_b6ocay	3.00	0.20	4
1428	1	\N	\N	2026-08-29 16:20:29.166	15	pb_10_1788000614157_5r8zho	3.00	0.20	4
1440	1	\N	\N	2026-08-29 16:23:55.034	15	pb_10_1788000820020_axkpk4	3.00	0.20	4
1455	1	\N	\N	2026-08-29 16:28:12.406	15	pb_10_1788001077392_7qd1pm	3.00	0.20	4
1470	1	\N	\N	2026-08-29 16:32:49.605	35	pb_10_1788001334772_11d5bx	7.00	0.20	4
205	1	\N	\N	2026-08-07 23:25:09.340538	15	\N	0.00	0.20	\N
1881	1	\N	23	2026-09-06 18:00:10.260495	30	pb_23_1788697779065_0hfjzu	10.50	0.20	\N
1851	1	\N	22	2026-09-06 17:29:27.373936	19	pb_22_1788695947590_e8r1f4	6.65	0.20	\N
1866	1	\N	22	2026-09-06 17:46:14.512607	101	pb_22_1788696872663_wxme3h	35.35	0.20	\N
1873	1	\N	22	2026-09-06 17:49:09.611959	19	pb_22_1788697129470_hn492s	6.65	0.20	\N
1750	1	\N	\N	2026-09-06 16:37:10.817815	30	pb_20_1788692799542_pw4rmi	10.50	0.20	\N
1753	1	\N	\N	2026-09-06 16:38:40.924749	30	pb_20_1788692889615_bbsgfz	10.50	0.20	\N
1756	1	\N	\N	2026-09-06 16:40:11.009485	30	pb_20_1788692979692_r1gaor	10.50	0.20	\N
1759	1	\N	\N	2026-09-06 16:41:41.102845	30	pb_20_1788693069782_0pr5ln	10.50	0.20	\N
1763	1	\N	\N	2026-09-06 16:43:41.337722	30	pb_20_1788693189880_fjvznv	10.50	0.20	\N
1767	1	\N	\N	2026-09-06 16:45:41.418681	30	pb_20_1788693309979_qoje0z	10.50	0.20	\N
1768	1	\N	\N	2026-09-06 16:46:11.433871	30	pb_20_1788693340004_e25o18	10.50	0.20	\N
1771	1	\N	\N	2026-09-06 16:47:41.402489	30	pb_20_1788693430081_0q0vik	10.50	0.20	\N
1206	1	\N	\N	2026-08-29 15:35:06.223	15	\N	0.00	0.20	\N
1207	1	\N	\N	2026-08-29 15:35:07.985	15	\N	0.00	0.20	\N
1215	1	\N	\N	2026-08-29 15:35:59.99	15	\N	0.00	0.20	\N
1217	1	\N	\N	2026-08-29 15:35:59.99	15	\N	0.00	0.20	\N
1220	1	\N	\N	2026-08-29 15:36:51.447	15	\N	0.00	0.20	\N
1495	1	\N	\N	2026-08-29 16:40:08.01	26	pb_13_1788001781552_dm9mlt	5.20	0.20	4
1536	1	\N	\N	2026-08-29 16:55:19.626	26	pb_13_1788002693175_lpdp4r	0.52	0.02	4
1564	1	\N	\N	2026-08-29 17:03:50.088	26	pb_13_1788003203626_nmg7og	0.52	0.02	4
1568	1	\N	\N	2026-08-29 17:05:03.009	26	pb_13_1788003276561_hwa22w	0.52	0.02	4
1574	1	\N	\N	2026-08-29 17:06:52.396	26	pb_13_1788003385948_07of5b	0.52	0.02	4
1578	1	\N	\N	2026-08-29 17:08:05.344	26	pb_13_1788003458895_dp9h0f	0.52	0.02	4
1584	1	\N	\N	2026-08-29 17:09:54.743	26	pb_13_1788003568278_lycrmi	0.52	0.02	4
1602	1	\N	\N	2026-08-29 17:15:22.955	26	pb_13_1788003896499_3s6km2	0.52	0.02	4
1218	1	\N	\N	2026-08-29 15:36:41.44	10	\N	0.00	0.20	\N
1221	1	\N	\N	2026-08-29 15:36:41.44	10	\N	0.00	0.20	\N
1481	1	\N	\N	2026-08-29 16:36:00.707	10	pb_12_1788001550699_9s1tvp	2.00	0.20	4
1563	1	\N	\N	2026-08-29 17:03:23.625	10	pb_12_1788003193613_4srywq	0.20	0.02	4
1567	1	\N	\N	2026-08-29 17:04:36.56	10	pb_12_1788003266548_gb6uyl	0.20	0.02	4
1585	1	\N	\N	2026-08-29 17:10:04.758	10	pb_12_1788003594744_2jq2y9	0.20	0.02	4
1603	1	\N	\N	2026-08-29 17:15:32.963	10	pb_12_1788003922956_apscwi	0.20	0.02	4
1605	1	\N	\N	2026-08-29 17:16:09.419	10	pb_12_1788003959412_0umn55	0.20	0.02	4
1607	1	\N	\N	2026-08-29 17:16:45.892	10	pb_12_1788003995882_vp126q	0.20	0.02	4
1609	1	\N	\N	2026-08-29 17:17:22.339	10	pb_12_1788004032330_8lq1og	0.20	0.02	4
1647	1	\N	\N	2026-08-29 17:29:01.229	10	pb_12_1788004731221_3b61wt	0.20	0.02	4
1581	1	\N	\N	2026-08-29 17:08:51.821	10	pb_12_1788003521807_6owf7c	0.20	0.02	4
1595	1	\N	\N	2026-08-29 17:13:07.097	10	pb_12_1788003777086_ejaqm3	0.20	0.02	4
1216	1	\N	\N	2026-08-29 15:36:26.429	15	\N	0.00	0.20	\N
1476	1	\N	\N	2026-08-29 16:34:32.792	15	pb_10_1788001457784_f7huce	3.00	0.20	4
1482	1	\N	\N	2026-08-29 16:36:15.714	15	pb_10_1788001560707_0p5n8r	3.00	0.20	4
1494	1	\N	\N	2026-08-29 16:39:41.551	15	pb_10_1788001766541_zhzmqf	3.00	0.20	4
1500	1	\N	\N	2026-08-29 16:41:24.499	15	pb_10_1788001869490_ufkle4	3.00	0.20	4
1772	1	\N	\N	2026-09-06 16:48:11.406812	30	pb_20_1788693460104_ojgwtv	10.50	0.20	\N
1775	1	\N	\N	2026-09-06 16:49:41.428584	30	pb_20_1788693550164_ugxxbh	10.50	0.20	\N
1776	1	\N	\N	2026-09-06 16:50:11.523439	30	pb_20_1788693580188_lv3fr6	10.50	0.20	\N
1785	1	\N	\N	2026-09-06 16:54:41.968551	30	pb_20_1788693850408_agteo7	10.50	0.20	\N
1788	1	\N	\N	2026-09-06 16:56:11.757298	30	pb_20_1788693940501_cl67ml	10.50	0.20	\N
1789	1	\N	\N	2026-09-06 16:56:41.805448	30	pb_20_1788693970527_7g4dtn	10.50	0.20	\N
1795	1	\N	\N	2026-09-06 16:59:41.904512	30	pb_20_1788694150659_gy87dk	10.50	0.20	\N
1802	1	\N	\N	2026-09-06 17:03:12.065114	30	pb_20_1788694360814_e6srs2	10.50	0.20	\N
1826	1	\N	\N	2026-09-06 17:15:12.629579	30	pb_20_1788695081404_mh3nmh	10.50	0.20	\N
1829	1	\N	\N	2026-09-06 17:16:42.846868	30	pb_20_1788695171479_rt1wqr	10.50	0.20	\N
1830	1	\N	\N	2026-09-06 17:17:12.745397	30	pb_20_1788695201507_wl9qrd	10.50	0.20	\N
1698	1	\N	\N	2026-09-06 16:08:29.196984	151	pb_20_1788690956240_tvofl0	52.85	0.20	\N
1752	1	\N	\N	2026-09-06 16:38:10.865041	30	pb_20_1788692859594_lxw3n8	10.50	0.20	\N
1755	1	\N	\N	2026-09-06 16:39:40.978407	30	pb_20_1788692949662_prdalu	10.50	0.20	\N
1757	1	\N	\N	2026-09-06 16:40:43.00233	30	pb_20_1788693009738_aqbbcr	10.50	0.20	\N
1761	1	\N	\N	2026-09-06 16:42:41.204518	30	pb_20_1788693129832_2mxfbo	10.50	0.20	\N
1827	1	\N	\N	2026-09-06 17:15:42.717168	30	pb_20_1788695111431_74xyta	10.50	0.20	\N
1699	1	\N	\N	2026-09-06 16:11:59.451642	30	pb_20_1788691288123_t1j63z	10.50	0.20	\N
1701	1	\N	\N	2026-09-06 16:12:59.524561	30	pb_20_1788691348175_7ymd1t	10.50	0.20	\N
1708	1	\N	\N	2026-09-06 16:16:29.79466	30	pb_20_1788691558331_ccddor	10.50	0.20	\N
1717	1	\N	\N	2026-09-06 16:20:40.055081	30	pb_20_1788691808761_k7r00f	10.50	0.20	\N
1719	1	\N	\N	2026-09-06 16:21:40.11079	30	pb_20_1788691868807_p9edis	10.50	0.20	\N
1723	1	\N	\N	2026-09-06 16:23:40.183758	30	pb_20_1788691988894_ihaefi	10.50	0.20	\N
1724	1	\N	\N	2026-09-06 16:24:10.205312	30	pb_20_1788692018914_bvf2oh	10.50	0.20	\N
1729	1	\N	\N	2026-09-06 16:26:40.332906	30	pb_20_1788692169022_wok0is	10.50	0.20	\N
1732	1	\N	\N	2026-09-06 16:28:10.372262	30	pb_20_1788692259078_cv82hp	10.50	0.20	\N
1686	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1687	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1688	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1689	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1690	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1691	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1692	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1693	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1694	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1882	1	\N	22	2026-09-06 18:04:48.166278	278	pb_22_1788697809096_qmbvrd	97.30	0.20	\N
1883	1	\N	22	2026-09-06 18:04:51.445848	3	pb_22_1788698087030_o36rsp	1.05	0.20	\N
1852	1	\N	22	2026-09-06 17:31:06.86919	99	pb_22_1788695966182_ynxka7	34.65	0.20	\N
1612	1	\N	\N	2026-08-29 17:19:43.552	15	pb_14_1788004168549_2bzkuq	0.30	0.02	4
1615	1	\N	\N	2026-08-29 17:20:35.044	15	pb_14_1788004220035_lpqlx2	0.30	0.02	4
1622	1	\N	\N	2026-08-29 17:22:28.012	24	pb_14_1788004324153_m49chw	0.48	0.02	4
1631	1	\N	\N	2026-08-29 17:25:02.43	15	pb_14_1788004487418_t4wmij	0.30	0.02	4
1649	1	\N	\N	2026-08-29 17:29:42.687	15	pb_14_1788004767674_adh2g5	0.30	0.02	4
1234	1	\N	\N	2026-08-29 15:39:58.592	15	\N	0.00	0.20	\N
1237	1	\N	\N	2026-08-29 15:39:58.592	15	\N	0.00	0.20	\N
1240	1	\N	\N	2026-08-29 15:40:50.044	15	\N	0.00	0.20	\N
1243	1	\N	\N	2026-08-29 15:40:50.044	15	\N	0.00	0.20	\N
1246	1	\N	\N	2026-08-29 15:41:41.519	15	\N	0.00	0.20	\N
1249	1	\N	\N	2026-08-29 15:41:41.519	15	\N	0.00	0.20	\N
1252	1	\N	\N	2026-08-29 15:42:33.001	15	\N	0.00	0.20	\N
1255	1	\N	\N	2026-08-29 15:42:33.001	15	\N	0.00	0.20	\N
1258	1	\N	\N	2026-08-29 15:43:24.466	15	\N	0.00	0.20	\N
1261	1	\N	\N	2026-08-29 15:43:24.466	15	\N	0.00	0.20	\N
1264	1	\N	\N	2026-08-29 15:44:15.928	15	\N	0.00	0.20	\N
1267	1	\N	\N	2026-08-29 15:44:15.928	15	\N	0.00	0.20	\N
1270	1	\N	\N	2026-08-29 15:45:07.403	15	\N	0.00	0.20	\N
1273	1	\N	\N	2026-08-29 15:45:07.403	15	\N	0.00	0.20	\N
1276	1	\N	\N	2026-08-29 15:45:58.873	15	\N	0.00	0.20	\N
1279	1	\N	\N	2026-08-29 15:45:58.873	15	\N	0.00	0.20	\N
1282	1	\N	\N	2026-08-29 15:46:50.354	15	\N	0.00	0.20	\N
1285	1	\N	\N	2026-08-29 15:46:50.354	15	\N	0.00	0.20	\N
1235	1	\N	\N	2026-08-29 15:39:48.582	10	\N	0.00	0.20	\N
1238	1	\N	\N	2026-08-29 15:40:40.029	10	\N	0.00	0.20	\N
1241	1	\N	\N	2026-08-29 15:40:40.029	10	\N	0.00	0.20	\N
1244	1	\N	\N	2026-08-29 15:41:31.512	10	\N	0.00	0.20	\N
1247	1	\N	\N	2026-08-29 15:41:31.512	10	\N	0.00	0.20	\N
1250	1	\N	\N	2026-08-29 15:42:22.987	10	\N	0.00	0.20	\N
1253	1	\N	\N	2026-08-29 15:42:22.987	10	\N	0.00	0.20	\N
1256	1	\N	\N	2026-08-29 15:43:14.454	10	\N	0.00	0.20	\N
1259	1	\N	\N	2026-08-29 15:43:14.454	10	\N	0.00	0.20	\N
1262	1	\N	\N	2026-08-29 15:44:05.918	10	\N	0.00	0.20	\N
1265	1	\N	\N	2026-08-29 15:44:05.918	10	\N	0.00	0.20	\N
1268	1	\N	\N	2026-08-29 15:44:57.39	10	\N	0.00	0.20	\N
1271	1	\N	\N	2026-08-29 15:44:57.39	10	\N	0.00	0.20	\N
1274	1	\N	\N	2026-08-29 15:45:48.861	10	\N	0.00	0.20	\N
1277	1	\N	\N	2026-08-29 15:45:48.861	10	\N	0.00	0.20	\N
1280	1	\N	\N	2026-08-29 15:46:40.344	10	\N	0.00	0.20	\N
1283	1	\N	\N	2026-08-29 15:46:40.344	10	\N	0.00	0.20	\N
1286	1	\N	\N	2026-08-29 15:47:31.812	10	\N	0.00	0.20	\N
1289	1	\N	\N	2026-08-29 15:47:31.812	10	\N	0.00	0.20	\N
1292	1	\N	\N	2026-08-29 15:48:23.27	10	\N	0.00	0.20	\N
1295	1	\N	\N	2026-08-29 15:48:23.27	10	\N	0.00	0.20	\N
1298	1	\N	\N	2026-08-29 15:49:14.731	10	\N	0.00	0.20	\N
1301	1	\N	\N	2026-08-29 15:49:14.731	10	\N	0.00	0.20	\N
1302	1	\N	\N	2026-08-29 15:54:14.071	10	\N	0.00	0.20	\N
1514	1	\N	\N	2026-08-29 16:44:58.175	10	pb_12_1788002088163_lkzo3v	0.20	0.02	4
1616	1	\N	\N	2026-08-29 17:20:45.059	10	pb_12_1788004235045_lz3zh9	0.20	0.02	4
1620	1	\N	\N	2026-08-29 17:21:37.686	10	pb_12_1788004287677_rwbywc	0.20	0.02	4
1623	1	\N	\N	2026-08-29 17:22:38.031	10	pb_12_1788004348014_bcs9fl	0.20	0.02	4
1225	1	\N	\N	2026-08-29 15:37:17.912	15	\N	0.00	0.20	\N
1233	1	\N	\N	2026-08-29 15:39:33.573	15	\N	0.00	0.20	\N
1236	1	\N	\N	2026-08-29 15:40:25.017	15	\N	0.00	0.20	\N
1239	1	\N	\N	2026-08-29 15:40:25.017	15	\N	0.00	0.20	\N
1242	1	\N	\N	2026-08-29 15:41:16.503	15	\N	0.00	0.20	\N
1245	1	\N	\N	2026-08-29 15:41:16.503	15	\N	0.00	0.20	\N
1248	1	\N	\N	2026-08-29 15:42:07.976	15	\N	0.00	0.20	\N
1251	1	\N	\N	2026-08-29 15:42:07.976	15	\N	0.00	0.20	\N
1254	1	\N	\N	2026-08-29 15:42:59.441	15	\N	0.00	0.20	\N
1257	1	\N	\N	2026-08-29 15:42:59.441	15	\N	0.00	0.20	\N
1260	1	\N	\N	2026-08-29 15:43:50.911	15	\N	0.00	0.20	\N
1263	1	\N	\N	2026-08-29 15:43:50.911	15	\N	0.00	0.20	\N
1266	1	\N	\N	2026-08-29 15:44:42.38	15	\N	0.00	0.20	\N
1269	1	\N	\N	2026-08-29 15:44:42.38	15	\N	0.00	0.20	\N
1272	1	\N	\N	2026-08-29 15:45:33.85	15	\N	0.00	0.20	\N
1275	1	\N	\N	2026-08-29 15:45:33.85	15	\N	0.00	0.20	\N
1278	1	\N	\N	2026-08-29 15:46:25.334	15	\N	0.00	0.20	\N
1281	1	\N	\N	2026-08-29 15:46:25.334	15	\N	0.00	0.20	\N
1284	1	\N	\N	2026-08-29 15:47:16.807	15	\N	0.00	0.20	\N
1287	1	\N	\N	2026-08-29 15:47:16.807	15	\N	0.00	0.20	\N
1290	1	\N	\N	2026-08-29 15:48:08.265	15	\N	0.00	0.20	\N
1293	1	\N	\N	2026-08-29 15:48:08.265	15	\N	0.00	0.20	\N
1296	1	\N	\N	2026-08-29 15:48:59.725	15	\N	0.00	0.20	\N
1299	1	\N	\N	2026-08-29 15:48:59.725	15	\N	0.00	0.20	\N
1509	1	\N	\N	2026-08-29 16:43:30.244	15	pb_10_1788001995235_facwo1	0.30	0.02	4
1504	1	\N	\N	2026-08-29 16:48:27.002587	15	test_session_1788002306970	0.30	0.02	4
1884	1	\N	23	2026-09-06 18:05:21.572047	30	pb_23_1788698090337_ba5d43	10.50	0.20	\N
1868	1	\N	22	2026-09-06 17:46:59.409796	15	pb_22_1788697003295_dmap7m	5.25	0.20	\N
1736	1	\N	\N	2026-09-06 16:30:10.520108	30	pb_20_1788692379188_3iwe4a	10.50	0.20	\N
1739	1	\N	\N	2026-09-06 16:31:40.770313	30	pb_20_1788692469267_7ql6ps	10.50	0.20	\N
1747	1	\N	\N	2026-09-06 16:35:40.783678	30	pb_20_1788692709467_6ixon9	10.50	0.20	\N
1754	1	\N	\N	2026-09-06 16:39:10.983293	30	pb_20_1788692919640_bow2q8	10.50	0.20	\N
1764	1	\N	\N	2026-09-06 16:44:11.184598	30	pb_20_1788693219906_vszhov	10.50	0.20	\N
1766	1	\N	\N	2026-09-06 16:45:11.222942	30	pb_20_1788693279966_4yiwx9	10.50	0.20	\N
1769	1	\N	\N	2026-09-06 16:46:41.435978	30	pb_20_1788693370029_egh19n	10.50	0.20	\N
1770	1	\N	\N	2026-09-06 16:47:11.334776	30	pb_20_1788693400051_ydd4je	10.50	0.20	\N
1774	1	\N	\N	2026-09-06 16:49:11.401716	30	pb_20_1788693520148_r7i38s	10.50	0.20	\N
1828	1	\N	\N	2026-09-06 17:16:12.723473	30	pb_20_1788695141456_bhfxa1	10.50	0.20	\N
1833	1	\N	\N	2026-09-06 17:18:42.858944	30	pb_20_1788695291576_rukiac	10.50	0.20	\N
1700	1	\N	\N	2026-09-06 16:12:29.465564	30	pb_20_1788691318154_an9sfc	10.50	0.20	\N
1702	1	\N	\N	2026-09-06 16:13:29.532218	30	pb_20_1788691378198_esj7po	10.50	0.20	\N
1707	1	\N	\N	2026-09-06 16:15:59.620579	30	pb_20_1788691528307_uohluz	10.50	0.20	\N
1765	1	\N	\N	2026-09-06 16:44:41.216485	30	pb_20_1788693249931_932s3d	10.50	0.20	\N
1831	1	\N	\N	2026-09-06 17:17:42.803566	30	pb_20_1788695231530_o7atx7	10.50	0.20	\N
1832	1	\N	\N	2026-09-06 17:18:12.902666	30	pb_20_1788695261553_m6p6ps	10.50	0.20	\N
1619	1	\N	\N	2026-08-29 17:21:27.677	16	pb_14_1788004271503_iqqzvv	0.32	0.02	4
1625	1	\N	\N	2026-08-29 17:23:19.49	15	pb_14_1788004384481_3p1q82	0.30	0.02	4
1628	1	\N	\N	2026-08-29 17:24:10.948	15	pb_14_1788004435938_v52dvz	0.30	0.02	4
1313	1	\N	\N	2026-08-29 15:56:21.843	15	\N	3.00	0.20	4
1321	1	\N	\N	2026-08-29 15:58:04.829	15	\N	3.00	0.20	4
1325	1	\N	\N	2026-08-29 15:57:13.356	15	\N	3.00	0.20	4
1331	1	\N	\N	2026-08-29 15:58:04.829	15	\N	3.00	0.20	4
1332	1	\N	\N	2026-08-29 15:59:47.768	15	\N	3.00	0.20	4
1335	1	\N	\N	2026-08-29 15:58:56.286	15	\N	3.00	0.20	4
1507	1	\N	\N	2026-08-29 16:43:05.224	26	pb_13_1788001958752_555fc8	0.52	0.02	4
1522	1	\N	\N	2026-08-29 16:51:33.467	19	pb_13_1788002474080_rijdcs	0.38	0.02	4
1627	1	\N	\N	2026-08-29 17:23:55.937	26	pb_13_1788004409505_rlzj89	0.52	0.02	4
1630	1	\N	\N	2026-08-29 17:24:47.417	26	pb_13_1788004460961_udzr7i	0.52	0.02	4
1314	1	\N	\N	2026-08-29 15:56:48.334	10	\N	2.00	0.20	4
1318	1	\N	\N	2026-08-29 15:57:39.804	10	\N	2.00	0.20	4
1322	1	\N	\N	2026-08-29 15:58:31.271	10	\N	2.00	0.20	4
1613	1	\N	\N	2026-08-29 17:19:53.56	10	pb_12_1788004183553_18024k	0.20	0.02	4
1626	1	\N	\N	2026-08-29 17:23:29.504	10	pb_12_1788004399491_mbmfwi	0.20	0.02	4
1629	1	\N	\N	2026-08-29 17:24:20.96	10	pb_12_1788004450949_cbfbkt	0.20	0.02	4
1315	1	\N	\N	2026-08-29 15:56:58.345	15	\N	3.00	0.20	4
1319	1	\N	\N	2026-08-29 15:57:49.818	15	\N	3.00	0.20	4
1323	1	\N	\N	2026-08-29 15:56:58.345	15	\N	3.00	0.20	4
1324	1	\N	\N	2026-08-29 15:58:41.277	15	\N	3.00	0.20	4
1505	1	\N	\N	2026-08-29 16:42:38.751	15	pb_10_1788001943714_vrriy6	0.30	0.02	4
1518	1	\N	\N	2026-08-29 16:46:04.638	15	pb_10_1788002149632_dbxjc0	0.30	0.02	4
1853	1	\N	\N	2026-09-06 17:31:36.842879	30	pb_20_1788696065639_5uqz7y	10.50	0.20	\N
1867	1	\N	\N	2026-09-06 17:46:44.479177	30	pb_20_1788696973252_4ssiwf	10.50	0.20	\N
1839	1	\N	\N	2026-09-06 17:21:43.002433	30	pb_20_1788695471710_ssxxbv	10.50	0.20	\N
1843	1	\N	\N	2026-09-06 17:23:43.052561	30	pb_20_1788695591811_44ib2h	10.50	0.20	\N
1844	1	\N	\N	2026-09-06 17:24:13.09103	30	pb_20_1788695621833_bxo19l	10.50	0.20	\N
1748	1	\N	\N	2026-09-06 16:36:10.765659	30	pb_20_1788692739496_muvzai	10.50	0.20	\N
1751	1	\N	\N	2026-09-06 16:37:40.950677	30	pb_20_1788692829563_6oadp3	10.50	0.20	\N
1758	1	\N	\N	2026-09-06 16:41:11.109199	30	pb_20_1788693039758_3dzx9x	10.50	0.20	\N
1760	1	\N	\N	2026-09-06 16:42:11.090419	30	pb_20_1788693099807_0pzhuu	10.50	0.20	\N
1804	1	\N	\N	2026-09-06 17:04:12.112492	30	pb_20_1788694420862_vk4w13	10.50	0.20	\N
1806	1	\N	\N	2026-09-06 17:05:12.154307	30	pb_20_1788694480911_bowg8g	10.50	0.20	\N
1810	1	\N	\N	2026-09-06 17:07:12.270124	30	pb_20_1788694601026_dlvk0u	10.50	0.20	\N
1811	1	\N	\N	2026-09-06 17:07:42.378447	30	pb_20_1788694631053_vi81q4	10.50	0.20	\N
1813	1	\N	\N	2026-09-06 17:08:42.334248	30	pb_20_1788694691102_zksihc	10.50	0.20	\N
1814	1	\N	\N	2026-09-06 17:09:12.354192	30	pb_20_1788694721125_v7zxi4	10.50	0.20	\N
1818	1	\N	\N	2026-09-06 17:11:12.46329	30	pb_20_1788694841223_xqwamv	10.50	0.20	\N
1819	1	\N	\N	2026-09-06 17:11:42.616129	30	pb_20_1788694871252_ipmtfq	10.50	0.20	\N
1821	1	\N	\N	2026-09-06 17:12:42.541363	30	pb_20_1788694931294_d3fjd3	10.50	0.20	\N
1822	1	\N	\N	2026-09-06 17:13:12.536759	30	pb_20_1788694961310_mhbbg4	10.50	0.20	\N
1824	1	\N	\N	2026-09-06 17:14:12.584181	30	pb_20_1788695021357_98p759	10.50	0.20	\N
1825	1	\N	\N	2026-09-06 17:14:42.629858	30	pb_20_1788695051379_vaxsz9	10.50	0.20	\N
1865	1	\N	\N	2026-09-06 17:44:33.959199	30	pb_20_1788696842640_7vv0rt	10.50	0.20	\N
1749	1	\N	\N	2026-09-06 16:36:40.82657	30	pb_20_1788692769517_p5qzk6	10.50	0.20	\N
1762	1	\N	\N	2026-09-06 16:43:11.124071	30	pb_20_1788693159858_fwgv3k	10.50	0.20	\N
1805	1	\N	\N	2026-09-06 17:04:42.141428	30	pb_20_1788694450884_avc5b8	10.50	0.20	\N
1807	1	\N	\N	2026-09-06 17:05:42.211134	30	pb_20_1788694510948_befvm4	10.50	0.20	\N
1808	1	\N	\N	2026-09-06 17:06:12.209535	30	pb_20_1788694540976_75yug0	10.50	0.20	\N
1809	1	\N	\N	2026-09-06 17:06:42.229561	30	pb_20_1788694571000_qqlzup	10.50	0.20	\N
1812	1	\N	\N	2026-09-06 17:08:12.317477	30	pb_20_1788694661075_poacj8	10.50	0.20	\N
1815	1	\N	\N	2026-09-06 17:09:42.410073	30	pb_20_1788694751152_ua6ueb	10.50	0.20	\N
1816	1	\N	\N	2026-09-06 17:10:12.41066	30	pb_20_1788694781183_sapk70	10.50	0.20	\N
1817	1	\N	\N	2026-09-06 17:10:42.443377	30	pb_20_1788694811202_xf8ipc	10.50	0.20	\N
1820	1	\N	\N	2026-09-06 17:12:12.455868	30	pb_20_1788694901274_uyqjkg	10.50	0.20	\N
1885	1	\N	22	2026-09-06 18:07:00.976009	99	pb_22_1788698120365_ug4sqt	34.65	0.20	\N
1887	1	\N	22	2026-09-06 18:09:10.522529	100	pb_22_1788698249778_i2dwy7	35.00	0.20	\N
1854	1	\N	22	2026-09-06 17:33:16.294339	99	pb_22_1788696095672_a4v1ud	34.65	0.20	\N
1856	1	\N	22	2026-09-06 17:35:25.813569	99	pb_22_1788696225137_v13r8n	34.65	0.20	\N
1858	1	\N	22	2026-09-06 17:37:35.324854	99	pb_22_1788696354635_3qlmv2	34.65	0.20	\N
1869	1	\N	22	2026-09-06 17:47:00.996771	1	pb_22_1788697018632_lt2hs6	0.35	0.20	\N
1703	1	\N	\N	2026-09-06 16:13:59.586708	30	pb_20_1788691408227_kpk83n	10.50	0.20	\N
1704	1	\N	\N	2026-09-06 16:14:29.55468	30	pb_20_1788691438249_mtdw94	10.50	0.20	\N
1709	1	\N	\N	2026-09-06 16:16:59.701584	30	pb_20_1788691588350_hzk1zc	10.50	0.20	\N
1713	1	\N	\N	2026-09-06 16:18:59.764054	30	pb_20_1788691708442_ukm774	10.50	0.20	\N
1725	1	\N	\N	2026-09-06 16:24:40.274607	30	pb_20_1788692048938_ceyhkk	10.50	0.20	\N
1742	1	\N	\N	2026-09-06 16:33:10.620166	30	pb_20_1788692559342_91dhd5	10.50	0.20	\N
1773	1	\N	\N	2026-09-06 16:48:41.348792	30	pb_20_1788693490131_7vmzwf	10.50	0.20	\N
1778	1	\N	\N	2026-09-06 16:51:11.645937	30	pb_20_1788693640236_903on1	10.50	0.20	\N
1781	1	\N	\N	2026-09-06 16:52:41.614694	30	pb_20_1788693730307_s2e41u	10.50	0.20	\N
1783	1	\N	\N	2026-09-06 16:53:41.890056	30	pb_20_1788693790359_baot7r	10.50	0.20	\N
1791	1	\N	\N	2026-09-06 16:57:41.818199	30	pb_20_1788694030575_jl6lad	10.50	0.20	\N
1792	1	\N	\N	2026-09-06 16:58:12.188425	30	pb_20_1788694060595_mto9ze	10.50	0.20	\N
1796	1	\N	\N	2026-09-06 17:00:11.944032	30	pb_20_1788694180679_bfw404	10.50	0.20	\N
1798	1	\N	\N	2026-09-06 17:01:11.998004	30	pb_20_1788694240728_6eft0s	10.50	0.20	\N
1834	1	\N	\N	2026-09-06 17:19:12.889497	30	pb_20_1788695321601_47ocej	10.50	0.20	\N
1835	1	\N	\N	2026-09-06 17:19:42.848919	30	pb_20_1788695351616_09qs25	10.50	0.20	\N
1837	1	\N	\N	2026-09-06 17:20:42.871935	30	pb_20_1788695411660_9svbpf	10.50	0.20	\N
1634	1	\N	\N	2026-08-29 17:25:53.904	15	pb_14_1788004538892_f1ma57	0.30	0.02	4
1637	1	\N	\N	2026-08-29 17:26:45.361	15	pb_14_1788004590352_3vbjc3	0.30	0.02	4
1640	1	\N	\N	2026-08-29 17:27:36.835	15	pb_14_1788004641829_qruu4m	0.30	0.02	4
1316	1	\N	\N	2026-08-29 15:56:21.843	15	\N	3.00	0.20	4
1317	1	\N	\N	2026-08-29 15:57:13.356	15	\N	3.00	0.20	4
1326	1	\N	\N	2026-08-29 15:58:56.286	15	\N	3.00	0.20	4
1346	1	\N	\N	2026-08-29 16:01:30.716	15	\N	3.00	0.20	4
1347	1	\N	\N	2026-08-29 16:00:39.242	15	\N	3.00	0.20	4
1352	1	\N	\N	2026-08-29 16:02:22.187	15	\N	3.00	0.20	4
1353	1	\N	\N	2026-08-29 16:01:30.716	15	\N	3.00	0.20	4
1358	1	\N	\N	2026-08-29 16:03:13.638	15	\N	3.00	0.20	4
1359	1	\N	\N	2026-08-29 16:02:22.187	15	\N	3.00	0.20	4
1364	1	\N	\N	2026-08-29 16:04:05.121	15	\N	3.00	0.20	4
1365	1	\N	\N	2026-08-29 16:03:13.638	15	\N	3.00	0.20	4
1368	1	\N	\N	2026-08-29 16:04:05.121	15	\N	3.00	0.20	4
1633	1	\N	\N	2026-08-29 17:25:38.891	26	pb_13_1788004512445_h983cc	0.52	0.02	4
1636	1	\N	\N	2026-08-29 17:26:30.351	26	pb_13_1788004563918_yk9lwy	0.52	0.02	4
1639	1	\N	\N	2026-08-29 17:27:21.828	26	pb_13_1788004615376_xucqvi	0.52	0.02	4
1327	1	\N	\N	2026-08-29 15:57:39.804	10	\N	2.00	0.20	4
1328	1	\N	\N	2026-08-29 15:59:22.751	10	\N	2.00	0.20	4
1348	1	\N	\N	2026-08-29 16:01:57.173	10	\N	2.00	0.20	4
1349	1	\N	\N	2026-08-29 16:01:05.7	10	\N	2.00	0.20	4
1354	1	\N	\N	2026-08-29 16:02:48.623	10	\N	2.00	0.20	4
1355	1	\N	\N	2026-08-29 16:01:57.173	10	\N	2.00	0.20	4
1360	1	\N	\N	2026-08-29 16:03:40.105	10	\N	2.00	0.20	4
1361	1	\N	\N	2026-08-29 16:02:48.623	10	\N	2.00	0.20	4
1366	1	\N	\N	2026-08-29 16:03:40.105	10	\N	2.00	0.20	4
1508	1	\N	\N	2026-08-29 16:43:15.235	10	pb_12_1788001985225_j9dsui	0.20	0.02	4
1632	1	\N	\N	2026-08-29 17:25:12.444	10	pb_12_1788004502431_y8wm6g	0.20	0.02	4
1635	1	\N	\N	2026-08-29 17:26:03.917	10	pb_12_1788004553904_qk65lo	0.20	0.02	4
1638	1	\N	\N	2026-08-29 17:26:55.375	10	pb_12_1788004605361_xkkaf8	0.20	0.02	4
1641	1	\N	\N	2026-08-29 17:27:37.526	1	pb_12_1788004656836_ck134h	0.02	0.02	4
1329	1	\N	\N	2026-08-29 15:57:49.818	15	\N	3.00	0.20	4
1330	1	\N	\N	2026-08-29 15:59:32.758	15	\N	3.00	0.20	4
1334	1	\N	\N	2026-08-29 15:58:41.277	15	\N	3.00	0.20	4
1344	1	\N	\N	2026-08-29 16:01:15.708	15	\N	3.00	0.20	4
1345	1	\N	\N	2026-08-29 16:00:24.233	15	\N	3.00	0.20	4
1350	1	\N	\N	2026-08-29 16:02:07.178	15	\N	3.00	0.20	4
1351	1	\N	\N	2026-08-29 16:01:15.708	15	\N	3.00	0.20	4
1356	1	\N	\N	2026-08-29 16:02:58.63	15	\N	3.00	0.20	4
1357	1	\N	\N	2026-08-29 16:02:07.178	15	\N	3.00	0.20	4
1362	1	\N	\N	2026-08-29 16:03:50.112	15	\N	3.00	0.20	4
1363	1	\N	\N	2026-08-29 16:02:58.63	15	\N	3.00	0.20	4
1367	1	\N	\N	2026-08-29 16:03:50.112	15	\N	3.00	0.20	4
1369	1	\N	\N	2026-08-29 16:04:06.834	15	\N	3.00	0.20	4
1521	1	\N	\N	2026-08-29 16:51:14.079	273	pb_10_1788002201106_zqf101	5.46	0.02	4
1886	1	\N	23	2026-09-06 18:07:30.942806	30	pb_23_1788698219761_mfs4w1	10.50	0.20	\N
1320	1	\N	\N	2026-08-29 15:56:48.334	10	\N	2.00	0.20	4
1333	1	\N	\N	2026-08-29 15:58:31.271	10	\N	2.00	0.20	4
1511	1	\N	\N	2026-08-29 16:44:06.701	10	pb_12_1788002036691_srv6dy	0.20	0.02	4
1871	1	\N	22	2026-09-06 17:48:49.230755	89	pb_22_1788697038554_sut1of	31.15	0.20	\N
1705	1	\N	\N	2026-09-06 16:14:59.568382	30	pb_20_1788691468270_c4alef	10.50	0.20	\N
1706	1	\N	\N	2026-09-06 16:15:29.666388	30	pb_20_1788691498286_j92wxh	10.50	0.20	\N
1777	1	\N	\N	2026-09-06 16:50:41.628498	30	pb_20_1788693610210_dzhkk0	10.50	0.20	\N
1779	1	\N	\N	2026-09-06 16:51:41.556597	30	pb_20_1788693670262_atnupi	10.50	0.20	\N
1787	1	\N	\N	2026-09-06 16:55:41.815563	30	pb_20_1788693910476_en99eu	10.50	0.20	\N
1797	1	\N	\N	2026-09-06 17:00:41.957959	30	pb_20_1788694210709_f03y6x	10.50	0.20	\N
1799	1	\N	\N	2026-09-06 17:01:42.196558	30	pb_20_1788694270756_pnlcxz	10.50	0.20	\N
1836	1	\N	\N	2026-09-06 17:20:12.89439	30	pb_20_1788695381637_lg8dz5	10.50	0.20	\N
1845	1	\N	\N	2026-09-06 17:24:43.11947	30	pb_20_1788695651861_1ep2dg	10.50	0.20	\N
1855	1	\N	\N	2026-09-06 17:33:46.328471	30	pb_20_1788696195108_ry5wxl	10.50	0.20	\N
1823	1	\N	\N	2026-09-06 17:13:42.61022	30	pb_20_1788694991336_wpxp58	10.50	0.20	\N
1863	1	\N	\N	2026-09-06 17:42:24.450731	30	pb_20_1788696713206_2oirgl	10.50	0.20	\N
1695	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1696	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1697	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1878	1	\N	22	2026-09-06 17:55:08.008982	99	pb_22_1788697407381_xwn7lv	34.65	0.20	\N
1888	1	\N	23	2026-09-06 18:09:40.546307	30	pb_23_1788698349313_5z6n65	10.50	0.20	\N
1340	1	\N	\N	2026-08-29 16:00:39.242	15	\N	3.00	0.20	4
1341	1	\N	\N	2026-08-29 15:59:47.768	15	\N	3.00	0.20	4
1516	1	\N	\N	2026-08-29 16:45:39.624	26	pb_13_1788002113184_j2dlla	0.52	0.02	4
1336	1	\N	\N	2026-08-29 16:00:14.223	10	\N	2.00	0.20	4
1337	1	\N	\N	2026-08-29 15:59:22.751	10	\N	2.00	0.20	4
1342	1	\N	\N	2026-08-29 16:01:05.7	10	\N	2.00	0.20	4
1343	1	\N	\N	2026-08-29 16:00:14.223	10	\N	2.00	0.20	4
1520	1	\N	\N	2026-08-29 16:46:41.105	10	pb_12_1788002191099_hram55	0.20	0.02	4
1338	1	\N	\N	2026-08-29 16:00:24.233	15	\N	3.00	0.20	4
1339	1	\N	\N	2026-08-29 15:59:32.758	15	\N	3.00	0.20	4
1370	1	\N	\N	2026-08-29 16:04:10.974	15	\N	3.00	0.20	4
1512	1	\N	\N	2026-08-29 16:44:21.71	15	pb_10_1788002046702_9pati0	0.30	0.02	4
1515	1	\N	\N	2026-08-29 16:45:13.184	15	pb_10_1788002098176_mioas3	0.30	0.02	4
1874	1	\N	22	2026-09-06 17:50:49.114456	99	pb_22_1788697148508_huxbid	34.65	0.20	\N
1710	1	\N	\N	2026-09-06 16:17:29.646639	30	pb_20_1788691618365_cbskbp	10.50	0.20	\N
1712	1	\N	\N	2026-09-06 16:18:29.751727	30	pb_20_1788691678414_k8q5tl	10.50	0.20	\N
1716	1	\N	\N	2026-09-06 16:20:10.04238	30	pb_20_1788691778742_7zxasv	10.50	0.20	\N
1722	1	\N	\N	2026-09-06 16:23:10.164435	30	pb_20_1788691958870_t89nbm	10.50	0.20	\N
1726	1	\N	\N	2026-09-06 16:25:10.290662	30	pb_20_1788692078963_y1c5bp	10.50	0.20	\N
1727	1	\N	\N	2026-09-06 16:25:40.305745	30	pb_20_1788692108993_tfwnq4	10.50	0.20	\N
1730	1	\N	\N	2026-09-06 16:27:10.349216	30	pb_20_1788692199045_fnk2u5	10.50	0.20	\N
1731	1	\N	\N	2026-09-06 16:27:40.348542	30	pb_20_1788692229057_zzwd87	10.50	0.20	\N
1733	1	\N	\N	2026-09-06 16:28:40.413361	30	pb_20_1788692289108_5d3431	10.50	0.20	\N
1734	1	\N	\N	2026-09-06 16:29:10.408908	30	pb_20_1788692319131_aadq7n	10.50	0.20	\N
1740	1	\N	\N	2026-09-06 16:32:10.590889	30	pb_20_1788692499293_5nq25o	10.50	0.20	\N
1743	1	\N	\N	2026-09-06 16:33:40.680168	30	pb_20_1788692589381_wewf5u	10.50	0.20	\N
1780	1	\N	\N	2026-09-06 16:52:11.563191	30	pb_20_1788693700284_u1hwzo	10.50	0.20	\N
1782	1	\N	\N	2026-09-06 16:53:11.590928	30	pb_20_1788693760333_eau3zu	10.50	0.20	\N
1784	1	\N	\N	2026-09-06 16:54:11.690306	30	pb_20_1788693820387_4ycisd	10.50	0.20	\N
1786	1	\N	\N	2026-09-06 16:55:11.710561	30	pb_20_1788693880459_qagvd0	10.50	0.20	\N
1790	1	\N	\N	2026-09-06 16:57:11.829893	30	pb_20_1788694000551_5z34uz	10.50	0.20	\N
1794	1	\N	\N	2026-09-06 16:59:11.901554	30	pb_20_1788694120643_x027lf	10.50	0.20	\N
1838	1	\N	\N	2026-09-06 17:21:12.896	30	pb_20_1788695441687_rfdzq9	10.50	0.20	\N
1841	1	\N	\N	2026-09-06 17:22:42.981228	30	pb_20_1788695531764_0nlbo5	10.50	0.20	\N
1842	1	\N	\N	2026-09-06 17:23:13.013402	30	pb_20_1788695561782_60x5ke	10.50	0.20	\N
1857	1	\N	\N	2026-09-06 17:35:55.881123	30	pb_20_1788696324599_fqcz3o	10.50	0.20	\N
1859	1	\N	\N	2026-09-06 17:38:05.34708	30	pb_20_1788696454072_j13lwd	10.50	0.20	\N
1872	1	\N	\N	2026-09-06 17:48:50.617288	1	pb_20_1788697128578_b7xunp	0.35	0.20	\N
1889	1	\N	22	2026-09-06 18:11:20.022833	99	pb_22_1788698379364_g9iqgy	34.65	0.20	\N
1890	1	\N	23	2026-09-06 18:11:50.030089	30	pb_23_1788698478841_taev7q	10.50	0.20	\N
1519	1	\N	\N	2026-08-29 16:46:31.098	26	pb_13_1788002164638_kmj9li	0.52	0.02	4
1517	1	\N	\N	2026-08-29 16:45:49.631	10	pb_12_1788002139624_i6022a	0.20	0.02	4
1371	1	\N	\N	2026-08-29 16:22:36.938891	15	test_session_1788000756917	3.00	0.20	4
1372	1	\N	\N	2026-08-29 16:25:30.397857	15	test_session_1788000930375	3.00	0.20	4
1860	1	\N	22	2026-09-06 17:39:44.934528	100	pb_22_1788696484099_rdyrgo	35.00	0.20	\N
1711	1	\N	\N	2026-09-06 16:17:59.760849	30	pb_20_1788691648385_okmpa5	10.50	0.20	\N
1714	1	\N	\N	2026-09-06 16:19:09.979219	10	pb_20_1788691738463_cmn53r	3.50	0.20	\N
1735	1	\N	\N	2026-09-06 16:29:40.505179	30	pb_20_1788692349160_yb5llj	10.50	0.20	\N
1738	1	\N	\N	2026-09-06 16:31:10.511273	30	pb_20_1788692439244_wsg20d	10.50	0.20	\N
1744	1	\N	\N	2026-09-06 16:34:10.697978	30	pb_20_1788692619410_74kyzz	10.50	0.20	\N
1746	1	\N	\N	2026-09-06 16:35:10.813364	30	pb_20_1788692679452_zi2rsp	10.50	0.20	\N
1793	1	\N	\N	2026-09-06 16:58:41.873008	30	pb_20_1788694090623_28j5l2	10.50	0.20	\N
1801	1	\N	\N	2026-09-06 17:02:42.03337	30	pb_20_1788694330799_u15ecz	10.50	0.20	\N
1840	1	\N	\N	2026-09-06 17:22:12.970685	30	pb_20_1788695501737_a6v7eu	10.50	0.20	\N
1875	1	\N	\N	2026-09-06 17:51:19.132368	30	pb_20_1788697247896_v52wlt	10.50	0.20	\N
1846	1	\N	22	2026-09-06 17:26:24.325188	101	pb_22_1788695681879_ud1khi	35.35	0.20	\N
1847	1	\N	22	2026-09-06 17:28:03.694134	100	pb_22_1788695782933_z3wfex	35.00	0.20	\N
1876	1	\N	22	2026-09-06 17:52:58.55436	99	pb_22_1788697277944_dtv73j	34.65	0.20	\N
1715	1	\N	\N	2026-09-06 16:19:40.031276	30	pb_20_1788691748719_qugh8p	10.50	0.20	\N
1718	1	\N	\N	2026-09-06 16:21:10.092428	30	pb_20_1788691838780_2c04b6	10.50	0.20	\N
1720	1	\N	\N	2026-09-06 16:22:10.142953	30	pb_20_1788691898832_pd981h	10.50	0.20	\N
1721	1	\N	\N	2026-09-06 16:22:40.225028	30	pb_20_1788691928851_s8lzuc	10.50	0.20	\N
1728	1	\N	\N	2026-09-06 16:26:10.329337	30	pb_20_1788692139013_42hsn3	10.50	0.20	\N
1737	1	\N	\N	2026-09-06 16:30:40.513847	30	pb_20_1788692409221_04d7rk	10.50	0.20	\N
1741	1	\N	\N	2026-09-06 16:32:40.617758	30	pb_20_1788692529320_6xllpu	10.50	0.20	\N
1745	1	\N	\N	2026-09-06 16:34:40.7273	30	pb_20_1788692649436_jm1nf6	10.50	0.20	\N
1800	1	\N	\N	2026-09-06 17:02:12.081516	30	pb_20_1788694300781_kcflc1	10.50	0.20	\N
1803	1	\N	\N	2026-09-06 17:03:42.10173	30	pb_20_1788694390838_oome99	10.50	0.20	\N
1861	1	\N	\N	2026-09-06 17:40:14.920028	30	pb_20_1788696583711_4vtj5g	10.50	0.20	\N
1877	1	\N	\N	2026-09-06 17:53:28.578882	30	pb_20_1788697377360_ga034p	10.50	0.20	\N
1374	1	\N	\N	2026-08-29 16:05:04.533	26	pb_13_1787999678064_hztppg	5.20	0.20	4
1377	1	\N	\N	2026-08-29 16:05:56.01	26	pb_13_1787999729549_i68iii	5.20	0.20	4
1387	1	\N	\N	2026-08-29 16:08:30.437	26	pb_13_1787999883980_8r57vu	5.20	0.20	4
1444	1	\N	\N	2026-08-29 16:25:12.954	26	pb_13_1788000886495_nrjtlk	5.20	0.20	4
1474	1	\N	\N	2026-08-29 16:34:07.772	26	pb_13_1788001421326_l79s6y	5.20	0.20	4
1477	1	\N	\N	2026-08-29 16:34:59.242	26	pb_13_1788001472792_e52hhq	5.20	0.20	4
1480	1	\N	\N	2026-08-29 16:35:50.699	26	pb_13_1788001524264_5zzy9b	5.20	0.20	4
1486	1	\N	\N	2026-08-29 16:37:33.613	26	pb_13_1788001627186_k5m44t	5.20	0.20	4
1528	1	\N	\N	2026-08-29 16:52:53.791	26	pb_13_1788002547342_2kql83	0.52	0.02	4
1532	1	\N	\N	2026-08-29 16:54:06.709	26	pb_13_1788002620253_nk5chf	0.52	0.02	4
1534	1	\N	\N	2026-08-29 16:54:43.162	26	pb_13_1788002656717_21m2ik	0.52	0.02	4
1540	1	\N	\N	2026-08-29 16:56:32.539	26	pb_13_1788002766096_9uy2om	0.52	0.02	4
1544	1	\N	\N	2026-08-29 16:57:45.461	26	pb_13_1788002839003_ac6u9q	0.52	0.02	4
1548	1	\N	\N	2026-08-29 16:58:58.354	26	pb_13_1788002911915_bs4kgx	0.52	0.02	4
1552	1	\N	\N	2026-08-29 17:00:11.288	26	pb_13_1788002984839_hlezmf	0.52	0.02	4
1554	1	\N	\N	2026-08-29 17:00:47.759	26	pb_13_1788003021296_nz623q	0.52	0.02	4
1558	1	\N	\N	2026-08-29 17:02:00.684	26	pb_13_1788003094225_efc9va	0.52	0.02	4
1375	1	\N	\N	2026-08-29 16:05:14.54	10	pb_12_1787999704534_v7pi55	2.00	0.20	4
1378	1	\N	\N	2026-08-29 16:06:06.023	10	pb_12_1787999756011_0whsel	2.00	0.20	4
1427	1	\N	\N	2026-08-29 16:20:14.157	10	pb_12_1788000604148_upkovg	2.00	0.20	4
1475	1	\N	\N	2026-08-29 16:34:17.783	10	pb_12_1788001447773_9usyoz	2.00	0.20	4
1478	1	\N	\N	2026-08-29 16:35:09.256	10	pb_12_1788001499243_6oln60	2.00	0.20	4
1484	1	\N	\N	2026-08-29 16:36:52.178	10	pb_12_1788001602168_d477s5	2.00	0.20	4
1493	1	\N	\N	2026-08-29 16:39:26.541	10	pb_12_1788001756531_bje4j5	2.00	0.20	4
1524	1	\N	\N	2026-08-29 16:51:50.86	10	pb_12_1788002500854_y2kip6	0.20	0.02	4
1531	1	\N	\N	2026-08-29 16:53:40.252	10	pb_12_1788002610246_61m09e	0.20	0.02	4
1539	1	\N	\N	2026-08-29 16:56:06.095	10	pb_12_1788002756084_71fxs9	0.20	0.02	4
1541	1	\N	\N	2026-08-29 16:56:42.55	10	pb_12_1788002792539_0qtxkv	0.20	0.02	4
1553	1	\N	\N	2026-08-29 17:00:21.295	10	pb_12_1788003011288_d97bxp	0.20	0.02	4
1573	1	\N	\N	2026-08-29 17:06:25.948	10	pb_12_1788003375936_yqz8rr	0.20	0.02	4
1373	1	\N	\N	2026-08-29 16:04:38.064	15	pb_10_1787999663056_xavj8j	3.00	0.20	4
1376	1	\N	\N	2026-08-29 16:05:29.549	15	pb_10_1787999714541_o4zd8p	3.00	0.20	4
1379	1	\N	\N	2026-08-29 16:06:21.035	15	pb_10_1787999766024_colurd	3.00	0.20	4
1479	1	\N	\N	2026-08-29 16:35:24.263	15	pb_10_1788001509256_gud9ds	3.00	0.20	4
1485	1	\N	\N	2026-08-29 16:37:07.186	15	pb_10_1788001612178_j5ua82	3.00	0.20	4
1497	1	\N	\N	2026-08-29 16:40:33.025	15	pb_10_1788001818017_ot0r8z	3.00	0.20	4
1523	1	\N	\N	2026-08-29 16:51:40.852	1	pb_10_1788002499410_n32mfk	0.02	0.02	4
1848	1	\N	22	2026-09-06 17:29:06.980239	63	pb_22_1788695882484_s2vhvk	22.05	0.20	\N
1862	1	\N	22	2026-09-06 17:41:54.392181	99	pb_22_1788696613749_qbb0bb	34.65	0.20	\N
1870	1	\N	22	2026-09-06 17:47:19.674264	19	pb_22_1788697019745_598y31	6.65	0.20	\N
1653	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1654	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1655	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1656	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1657	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1658	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1659	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1380	1	\N	\N	2026-08-29 16:06:47.493	26	pb_13_1787999781036_cxnm12	5.20	0.20	4
1383	1	\N	\N	2026-08-29 16:07:38.955	26	pb_13_1787999832513_3wiiws	5.20	0.20	4
1411	1	\N	\N	2026-08-29 16:15:46.784	26	pb_13_1788000320332_u6atez	5.20	0.20	4
1414	1	\N	\N	2026-08-29 16:16:38.258	26	pb_13_1788000371807_24xg7c	5.20	0.20	4
1426	1	\N	\N	2026-08-29 16:20:04.148	26	pb_13_1788000577711_is78r3	5.20	0.20	4
1432	1	\N	\N	2026-08-29 16:21:47.076	26	pb_13_1788000680623_6avrke	5.20	0.20	4
1447	1	\N	\N	2026-08-29 16:26:04.421	26	pb_13_1788000937976_ycbczu	5.20	0.20	4
1450	1	\N	\N	2026-08-29 16:26:55.892	26	pb_13_1788000989441_rtpsec	5.20	0.20	4
1453	1	\N	\N	2026-08-29 16:27:47.376	26	pb_13_1788001040916_qx7234	5.20	0.20	4
1468	1	\N	\N	2026-08-29 16:32:04.763	26	pb_13_1788001298316_2zbbpa	5.20	0.20	4
1489	1	\N	\N	2026-08-29 16:38:25.07	26	pb_13_1788001678628_c3m1h3	5.20	0.20	4
1492	1	\N	\N	2026-08-29 16:39:16.53	26	pb_13_1788001730085_o1wptg	5.20	0.20	4
1525	1	\N	\N	2026-08-29 16:52:17.333	26	pb_13_1788002510860_sz8koa	0.52	0.02	4
1538	1	\N	\N	2026-08-29 16:55:56.083	26	pb_13_1788002729640_ik0go2	0.52	0.02	4
1560	1	\N	\N	2026-08-29 17:02:37.134	26	pb_13_1788003130697_i2ul61	0.52	0.02	4
1562	1	\N	\N	2026-08-29 17:03:13.612	26	pb_13_1788003167145_p6anzj	0.52	0.02	4
1572	1	\N	\N	2026-08-29 17:06:15.936	26	pb_13_1788003349473_3jrinn	0.52	0.02	4
1596	1	\N	\N	2026-08-29 17:13:33.561	26	pb_13_1788003787098_taa51s	0.52	0.02	4
1608	1	\N	\N	2026-08-29 17:17:12.33	26	pb_13_1788004005892_ql4att	0.52	0.02	4
1610	1	\N	\N	2026-08-29 17:17:48.802	26	pb_13_1788004042340_y3vrwn	0.52	0.02	4
1381	1	\N	\N	2026-08-29 16:06:57.504	10	pb_12_1787999807496_mpnyqg	2.00	0.20	4
1412	1	\N	\N	2026-08-29 16:15:56.796	10	pb_12_1788000346785_n54ocb	2.00	0.20	4
1430	1	\N	\N	2026-08-29 16:21:05.615	10	pb_12_1788000655609_0qnk2l	2.00	0.20	4
1442	1	\N	\N	2026-08-29 16:24:31.483	10	pb_12_1788000861472_b8x4x5	2.00	0.20	4
1445	1	\N	\N	2026-08-29 16:25:22.967	10	pb_12_1788000912954_7ljlwe	2.00	0.20	4
1448	1	\N	\N	2026-08-29 16:26:14.43	10	pb_12_1788000964422_kxh3j5	2.00	0.20	4
1451	1	\N	\N	2026-08-29 16:27:05.905	10	pb_12_1788001015893_n277er	2.00	0.20	4
1454	1	\N	\N	2026-08-29 16:27:57.391	10	pb_12_1788001067376_gfa674	2.00	0.20	4
1472	1	\N	\N	2026-08-29 16:33:26.318	10	pb_12_1788001396306_sshn1j	2.00	0.20	4
1487	1	\N	\N	2026-08-29 16:37:43.619	10	pb_12_1788001653613_3v9n45	2.00	0.20	4
1490	1	\N	\N	2026-08-29 16:38:35.075	10	pb_12_1788001705070_yq67sj	2.00	0.20	4
1496	1	\N	\N	2026-08-29 16:40:18.016	10	pb_12_1788001808011_3qq9av	2.00	0.20	4
1529	1	\N	\N	2026-08-29 16:53:03.804	10	pb_12_1788002573792_7skg5j	0.20	0.02	4
1543	1	\N	\N	2026-08-29 16:57:19.003	10	pb_12_1788002828991_xj40ef	0.20	0.02	4
1547	1	\N	\N	2026-08-29 16:58:31.915	10	pb_12_1788002901912_80jss6	0.20	0.02	4
1561	1	\N	\N	2026-08-29 17:02:47.144	10	pb_12_1788003157135_fbmby8	0.20	0.02	4
1569	1	\N	\N	2026-08-29 17:05:13.019	10	pb_12_1788003303009_503ush	0.20	0.02	4
1571	1	\N	\N	2026-08-29 17:05:49.472	10	pb_12_1788003339467_756llm	0.20	0.02	4
1587	1	\N	\N	2026-08-29 17:10:41.223	10	pb_12_1788003631210_ya2k56	0.20	0.02	4
1589	1	\N	\N	2026-08-29 17:11:17.695	10	pb_12_1788003667684_p07czn	0.20	0.02	4
1593	1	\N	\N	2026-08-29 17:12:30.633	10	pb_12_1788003740625_0vk7ww	0.20	0.02	4
1382	1	\N	\N	2026-08-29 16:07:12.512	15	pb_10_1787999817505_7n84js	3.00	0.20	4
1386	1	\N	\N	2026-08-29 16:08:03.98	15	pb_10_1787999868970_a2z183	3.00	0.20	4
1410	1	\N	\N	2026-08-29 16:15:20.331	15	pb_10_1788000305309_xjhtyl	3.00	0.20	4
1413	1	\N	\N	2026-08-29 16:16:11.806	15	pb_10_1788000356797_hgrudf	3.00	0.20	4
1425	1	\N	\N	2026-08-29 16:19:37.711	15	pb_10_1788000562698_p4v1jt	3.00	0.20	4
1443	1	\N	\N	2026-08-29 16:24:46.494	15	pb_10_1788000871483_74sbiv	3.00	0.20	4
1446	1	\N	\N	2026-08-29 16:25:37.975	15	pb_10_1788000922967_wettap	3.00	0.20	4
1449	1	\N	\N	2026-08-29 16:26:29.441	15	pb_10_1788000974431_p9nfg1	3.00	0.20	4
1452	1	\N	\N	2026-08-29 16:27:20.915	15	pb_10_1788001025906_wusgvy	3.00	0.20	4
1467	1	\N	\N	2026-08-29 16:31:38.315	15	pb_10_1788001283307_xdu0l3	3.00	0.20	4
1488	1	\N	\N	2026-08-29 16:37:58.627	15	pb_10_1788001663620_lbow9t	3.00	0.20	4
1491	1	\N	\N	2026-08-29 16:38:50.085	15	pb_10_1788001715076_rkn761	3.00	0.20	4
1849	1	\N	22	2026-09-06 17:29:08.036352	1	pb_22_1788695946223_do3hpi	0.35	0.20	\N
1660	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1661	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1662	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1663	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
76	1	\N	\N	2026-08-02 01:30:20.802219	15	\N	0.00	0.20	\N
78	1	\N	\N	2026-08-02 01:30:40.982881	15	\N	0.00	0.20	\N
80	1	\N	\N	2026-08-02 01:31:01.170095	15	\N	0.00	0.20	\N
1664	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1665	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1666	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1667	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1668	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1669	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1670	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1671	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1672	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1673	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1674	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1675	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1676	1	\N	\N	2026-09-06 14:59:14.267405	30	\N	0.60	0.20	\N
1390	1	\N	\N	2026-08-29 16:09:22.349	27	pb_13_1787999935825_lz2ye3	5.40	0.20	4
1393	1	\N	\N	2026-08-29 16:10:13.807	26	pb_13_1787999987365_1z6fe6	5.20	0.20	4
1396	1	\N	\N	2026-08-29 16:11:05.275	26	pb_13_1788000038833_da7kd8	5.20	0.20	4
1399	1	\N	\N	2026-08-29 16:11:56.729	26	pb_13_1788000090297_nhb609	5.20	0.20	4
1402	1	\N	\N	2026-08-29 16:12:48.192	26	pb_13_1788000141745_vnxvss	5.20	0.20	4
1405	1	\N	\N	2026-08-29 16:13:39.666	26	pb_13_1788000193214_0nmjbr	5.20	0.20	4
1408	1	\N	\N	2026-08-29 16:14:31.127	26	pb_13_1788000244684_cfqq3n	5.20	0.20	4
1420	1	\N	\N	2026-08-29 16:18:21.218	26	pb_13_1788000474754_jyac9g	5.20	0.20	4
1441	1	\N	\N	2026-08-29 16:24:21.471	26	pb_13_1788000835034_zsx6p5	5.20	0.20	4
1456	1	\N	\N	2026-08-29 16:28:38.868	26	pb_13_1788001092406_c5q3fk	5.20	0.20	4
1459	1	\N	\N	2026-08-29 16:29:30.34	26	pb_13_1788001143887_dkgx8v	5.20	0.20	4
1465	1	\N	\N	2026-08-29 16:31:13.297	26	pb_13_1788001246843_yqj8o3	5.20	0.20	4
1546	1	\N	\N	2026-08-29 16:58:21.911	26	pb_13_1788002875468_0ua3zz	0.52	0.02	4
1550	1	\N	\N	2026-08-29 16:59:34.829	26	pb_13_1788002948367_i5w0xn	0.52	0.02	4
1556	1	\N	\N	2026-08-29 17:01:24.214	26	pb_13_1788003057768_cjh888	0.52	0.02	4
1594	1	\N	\N	2026-08-29 17:12:57.085	26	pb_13_1788003750634_9ldqjo	0.52	0.02	4
1598	1	\N	\N	2026-08-29 17:14:10.018	26	pb_13_1788003823571_e8bk38	0.52	0.02	4
1604	1	\N	\N	2026-08-29 17:15:59.411	26	pb_13_1788003932964_ximgyp	0.52	0.02	4
1606	1	\N	\N	2026-08-29 17:16:35.881	26	pb_13_1788003969420_eanljj	0.52	0.02	4
1384	1	\N	\N	2026-08-29 16:07:48.969	10	pb_12_1787999858955_1e9iqp	2.00	0.20	4
1388	1	\N	\N	2026-08-29 16:08:40.446	10	pb_12_1787999910437_e4abgc	2.00	0.20	4
1391	1	\N	\N	2026-08-29 16:09:32.357	10	pb_12_1787999962349_cxhgid	2.00	0.20	4
1394	1	\N	\N	2026-08-29 16:10:23.818	10	pb_12_1788000013808_ka1cta	2.00	0.20	4
1397	1	\N	\N	2026-08-29 16:11:15.287	10	pb_12_1788000065275_7zdcfj	2.00	0.20	4
1400	1	\N	\N	2026-08-29 16:12:06.736	10	pb_12_1788000116729_ra5khu	2.00	0.20	4
1403	1	\N	\N	2026-08-29 16:12:58.201	10	pb_12_1788000168193_vzib9t	2.00	0.20	4
1406	1	\N	\N	2026-08-29 16:13:49.674	10	pb_12_1788000219667_e48gnu	2.00	0.20	4
1409	1	\N	\N	2026-08-29 16:15:05.306	34	pb_12_1788000271128_9qkjyh	6.80	0.20	4
1424	1	\N	\N	2026-08-29 16:19:22.697	10	pb_12_1788000552688_00ookk	2.00	0.20	4
1439	1	\N	\N	2026-08-29 16:23:40.019	10	pb_12_1788000810012_ve3co9	2.00	0.20	4
1457	1	\N	\N	2026-08-29 16:28:48.878	10	pb_12_1788001118868_1moj8e	2.00	0.20	4
1460	1	\N	\N	2026-08-29 16:29:40.35	10	pb_12_1788001170340_0ubbze	2.00	0.20	4
1463	1	\N	\N	2026-08-29 16:30:31.832	10	pb_12_1788001221826_7zx5b3	2.00	0.20	4
1466	1	\N	\N	2026-08-29 16:31:23.306	10	pb_12_1788001273297_xcs9ks	2.00	0.20	4
1537	1	\N	\N	2026-08-29 16:55:29.639	10	pb_12_1788002719626_0rbbka	0.20	0.02	4
1545	1	\N	\N	2026-08-29 16:57:55.467	10	pb_12_1788002865461_2y33f7	0.20	0.02	4
1549	1	\N	\N	2026-08-29 16:59:08.366	10	pb_12_1788002938355_nfb54n	0.20	0.02	4
1551	1	\N	\N	2026-08-29 16:59:44.838	10	pb_12_1788002974829_unfl3f	0.20	0.02	4
1557	1	\N	\N	2026-08-29 17:01:34.223	10	pb_12_1788003084215_3sow6t	0.20	0.02	4
1575	1	\N	\N	2026-08-29 17:07:02.402	10	pb_12_1788003412396_i2zy69	0.20	0.02	4
1389	1	\N	\N	2026-08-29 16:08:55.825	15	pb_10_1787999920447_hobtvx	3.00	0.20	4
1392	1	\N	\N	2026-08-29 16:09:47.365	15	pb_10_1787999972358_b7iqqe	3.00	0.20	4
1395	1	\N	\N	2026-08-29 16:10:38.832	15	pb_10_1788000023818_8m71wf	3.00	0.20	4
1398	1	\N	\N	2026-08-29 16:11:30.296	15	pb_10_1788000075288_p4luz4	3.00	0.20	4
1401	1	\N	\N	2026-08-29 16:12:21.744	15	pb_10_1788000126737_rtic6i	3.00	0.20	4
1404	1	\N	\N	2026-08-29 16:13:13.213	15	pb_10_1788000178202_78sjj8	3.00	0.20	4
1407	1	\N	\N	2026-08-29 16:14:04.684	15	pb_10_1788000229675_hwodz5	3.00	0.20	4
1437	1	\N	\N	2026-08-29 16:23:03.562	15	pb_10_1788000768555_8aeyo1	3.00	0.20	4
1458	1	\N	\N	2026-08-29 16:29:03.886	15	pb_10_1788001128878_w4uqz1	3.00	0.20	4
1461	1	\N	\N	2026-08-29 16:29:55.361	15	pb_10_1788001180350_8dyyhr	3.00	0.20	4
1464	1	\N	\N	2026-08-29 16:30:46.843	15	pb_10_1788001231833_ji2bde	3.00	0.20	4
\.


--
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, description, updated_at) FROM stdin;
1	earning_rate_per_km	4	Earnings in ₹ per kilometer traveled	2026-07-31 16:05:43.703053
2	earning_rate_per_hour	15	Earnings in ₹ per hour of active time	2026-07-31 16:05:43.703053
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, status, created_at, updated_at) FROM stdin;
1	Super Admin	admin@srads.com	$2a$10$mHlPTS53dI3yJRKNajea1uqJsuPOIP4ZUxQimKIC2ujRKH.z2JFqq	Super Admin	Active	2026-07-31 16:05:43.703053	2026-07-31 16:05:43.703053
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_transactions (id, advertiser_id, amount, type, reason, created_at, cashfree_order_id, cashfree_payment_session_id, status, currency, cashfree_payment_id, payment_method, updated_at) FROM stdin;
1146	4	1080.00	Credit	Wallet top-up	2026-09-06 12:54:39.084125	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 12:54:39.084125
1193	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:11:59.451642	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:11:59.451642
1195	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:12:59.524561	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:12:59.524561
1199	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:14:59.568382	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:14:59.568382
1200	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:15:29.666388	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:15:29.666388
1204	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:17:29.646639	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:17:29.646639
1206	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:18:29.751727	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:18:29.751727
1210	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:20:10.04238	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:20:10.04238
1216	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:23:10.164435	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:23:10.164435
1220	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:25:10.290662	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:25:10.290662
1221	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:25:40.305745	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:25:40.305745
1224	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:27:10.349216	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:27:10.349216
1225	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:27:40.348542	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:27:40.348542
1227	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:28:40.413361	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:28:40.413361
1228	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:29:10.408908	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:29:10.408908
1234	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:32:10.590889	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:32:10.590889
1237	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:33:40.680168	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:33:40.680168
1246	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:38:10.865041	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:38:10.865041
1249	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:39:40.978407	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:39:40.978407
1251	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:40:43.00233	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:40:43.00233
1254	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:42:11.090419	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:42:11.090419
1257	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:43:41.337722	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:43:41.337722
1261	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:45:41.418681	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:45:41.418681
1262	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:46:11.433871	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:46:11.433871
1265	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:47:41.402489	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:47:41.402489
1266	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:48:11.406812	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:48:11.406812
1267	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:48:41.348792	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:48:41.348792
1269	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:49:41.428584	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:49:41.428584
1270	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:50:11.523439	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:50:11.523439
1272	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:51:11.645937	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:51:11.645937
1273	4	1255.60	Credit	Wallet top-up	2026-09-06 16:51:21.193789	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 16:51:21.193789
1274	4	1200.00	Credit	Wallet top-up	2026-09-06 16:51:30.442037	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 16:51:30.442037
1277	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:52:41.614694	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:52:41.614694
1279	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:53:41.890056	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:53:41.890056
1281	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:54:41.968551	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:54:41.968551
1284	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:56:11.757298	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:56:11.757298
1285	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:56:41.805448	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:56:41.805448
1287	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:57:41.818199	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:57:41.818199
1288	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:58:12.188425	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:58:12.188425
1289	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:58:41.873008	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:58:41.873008
1291	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:59:41.904512	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:59:41.904512
1292	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:00:11.944032	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:00:11.944032
1294	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:01:11.998004	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:01:11.998004
1297	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:02:42.03337	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:02:42.03337
1298	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:03:12.065114	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:03:12.065114
1301	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:04:42.141428	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:04:42.141428
1303	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:05:42.211134	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:05:42.211134
1304	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:06:12.209535	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:06:12.209535
1305	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:06:42.229561	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:06:42.229561
1308	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:08:12.317477	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:08:12.317477
1311	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:09:42.410073	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:09:42.410073
1312	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:10:12.41066	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:10:12.41066
1313	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:10:42.443377	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:10:42.443377
1317	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:12:42.541363	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:12:42.541363
1318	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:13:12.536759	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:13:12.536759
1320	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:14:12.584181	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:14:12.584181
1321	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:14:42.629858	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:14:42.629858
1323	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:15:42.717168	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:15:42.717168
1327	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:17:42.803566	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:17:42.803566
1328	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:18:12.902666	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:18:12.902666
1332	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:20:12.89439	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:20:12.89439
1336	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:22:12.970685	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:22:12.970685
1341	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:24:43.11947	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:24:43.11947
1342	4	35.35	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:26:24.325188	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:26:24.325188
1343	4	35.00	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:28:03.694134	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:28:03.694134
1344	4	22.05	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:29:06.980239	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:29:06.980239
1147	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1148	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1149	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1150	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1151	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1152	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1153	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1154	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1155	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1156	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1157	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1158	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1159	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1160	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1161	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1162	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1163	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1164	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1165	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1166	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1167	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1168	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1169	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1170	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1171	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1172	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1173	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1174	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1175	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1176	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1177	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1178	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1179	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1180	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1181	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1182	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1183	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1184	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1185	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1186	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1187	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1188	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1189	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1190	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1191	4	0.60	Debit	Simulated playback deduction	2026-09-06 14:59:14.267405	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 14:59:14.267405
1194	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:12:29.465564	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:12:29.465564
1196	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:13:29.532218	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:13:29.532218
1201	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:15:59.620579	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:15:59.620579
1205	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:17:59.760849	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:17:59.760849
1208	4	3.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:19:09.979219	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:19:09.979219
1229	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:29:40.505179	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:29:40.505179
1232	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:31:10.511273	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:31:10.511273
1238	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:34:10.697978	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:34:10.697978
1240	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:35:10.813364	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:35:10.813364
1243	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:36:40.82657	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:36:40.82657
1255	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:42:41.204518	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:42:41.204518
1258	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:44:11.184598	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:44:11.184598
1260	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:45:11.222942	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:45:11.222942
1263	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:46:41.435978	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:46:41.435978
1264	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:47:11.334776	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:47:11.334776
1268	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:49:11.401716	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:49:11.401716
1271	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:50:41.628498	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:50:41.628498
1275	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:51:41.556597	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:51:41.556597
1283	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:55:41.815563	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:55:41.815563
1293	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:00:41.957959	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:00:41.957959
1295	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:01:42.196558	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:01:42.196558
1296	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:02:12.081516	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:02:12.081516
1299	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:03:42.10173	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:03:42.10173
1192	4	52.85	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:08:29.196984	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:08:29.196984
1197	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:13:59.586708	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:13:59.586708
1198	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:14:29.55468	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:14:29.55468
1202	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:16:29.79466	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:16:29.79466
1203	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:16:59.701584	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:16:59.701584
1207	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:18:59.764054	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:18:59.764054
1209	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:19:40.031276	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:19:40.031276
1211	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:20:40.055081	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:20:40.055081
1212	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:21:10.092428	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:21:10.092428
1213	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:21:40.11079	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:21:40.11079
1214	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:22:10.142953	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:22:10.142953
1215	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:22:40.225028	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:22:40.225028
1217	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:23:40.183758	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:23:40.183758
1218	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:24:10.205312	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:24:10.205312
1219	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:24:40.274607	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:24:40.274607
1222	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:26:10.329337	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:26:10.329337
1223	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:26:40.332906	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:26:40.332906
1226	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:28:10.372262	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:28:10.372262
1230	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:30:10.520108	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:30:10.520108
1231	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:30:40.513847	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:30:40.513847
1233	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:31:40.770313	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:31:40.770313
1235	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:32:40.617758	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:32:40.617758
1236	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:33:10.620166	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:33:10.620166
1239	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:34:40.7273	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:34:40.7273
1241	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:35:40.783678	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:35:40.783678
1242	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:36:10.765659	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:36:10.765659
1244	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:37:10.817815	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:37:10.817815
1245	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:37:40.950677	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:37:40.950677
1247	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:38:40.924749	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:38:40.924749
1248	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:39:10.983293	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:39:10.983293
1250	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:40:11.009485	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:40:11.009485
208	3	1500.00	Credit	Funds added by Admin	2026-08-08 01:23:21.085994	\N	\N	SUCCESS	INR	\N	\N	2026-08-15 15:30:43.816906
1252	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:41:11.109199	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:41:11.109199
1253	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:41:41.102845	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:41:41.102845
1256	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:43:11.124071	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:43:11.124071
1259	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:44:41.216485	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:44:41.216485
1276	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:52:11.563191	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:52:11.563191
1278	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:53:11.590928	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:53:11.590928
1280	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:54:11.690306	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:54:11.690306
1282	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:55:11.710561	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:55:11.710561
1286	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:57:11.829893	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:57:11.829893
1290	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 16:59:11.901554	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 16:59:11.901554
1300	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:04:12.112492	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:04:12.112492
1302	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:05:12.154307	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:05:12.154307
1306	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:07:12.270124	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:07:12.270124
1307	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:07:42.378447	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:07:42.378447
1309	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:08:42.334248	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:08:42.334248
1310	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:09:12.354192	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:09:12.354192
1314	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:11:12.46329	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:11:12.46329
1315	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:11:42.616129	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:11:42.616129
1316	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:12:12.455868	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:12:12.455868
1319	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:13:42.61022	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:13:42.61022
1322	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:15:12.629579	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:15:12.629579
1324	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:16:12.723473	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:16:12.723473
1325	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:16:42.846868	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:16:42.846868
1326	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:17:12.745397	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:17:12.745397
1329	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:18:42.858944	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:18:42.858944
1330	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:19:12.889497	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:19:12.889497
1331	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:19:42.848919	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:19:42.848919
1333	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:20:42.871935	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:20:42.871935
1334	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:21:12.896	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:21:12.896
1335	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:21:43.002433	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:21:43.002433
1337	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:22:42.981228	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:22:42.981228
1338	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:23:13.013402	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:23:13.013402
1339	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:23:43.052561	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:23:43.052561
1340	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:24:13.09103	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:24:13.09103
1345	4	0.35	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:29:08.036352	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:29:08.036352
1346	4	0.35	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:29:08.773754	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:29:08.773754
1347	4	6.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:29:27.373936	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:29:27.373936
1348	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:31:06.86919	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:31:06.86919
1349	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:31:36.842879	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:31:36.842879
1350	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:33:16.294339	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:33:16.294339
1351	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:33:46.328471	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:33:46.328471
1352	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:35:25.813569	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:35:25.813569
1353	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:35:55.881123	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:35:55.881123
1354	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:37:35.324854	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:37:35.324854
1355	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:38:05.34708	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:38:05.34708
1356	4	35.00	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:39:44.934528	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:39:44.934528
1357	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:40:14.920028	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:40:14.920028
1358	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:41:54.392181	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:41:54.392181
1359	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:42:24.450731	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:42:24.450731
1360	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:44:03.837342	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:44:03.837342
1361	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:44:33.959199	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:44:33.959199
1362	4	35.35	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:46:14.512607	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:46:14.512607
1363	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:46:44.479177	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:46:44.479177
1364	4	5.25	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:46:59.409796	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:46:59.409796
1365	4	0.35	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:47:00.996771	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:47:00.996771
1366	4	6.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:47:19.674264	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:47:19.674264
1367	4	31.15	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:48:49.230755	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:48:49.230755
1368	4	0.35	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:48:50.617288	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:48:50.617288
1369	4	6.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:49:09.611959	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:49:09.611959
1370	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:50:49.114456	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:50:49.114456
1371	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:51:19.132368	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:51:19.132368
1372	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:52:58.55436	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:52:58.55436
1373	4	10.50	Debit	Playback deduction for Ad ID: 20	2026-09-06 17:53:28.578882	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:53:28.578882
1374	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:55:08.008982	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:55:08.008982
1375	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:56:49.61135	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:56:49.61135
1376	4	1273.00	Credit	Wallet top-up	2026-09-06 17:59:29.68756	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 17:59:29.68756
1377	4	59.85	Debit	Playback deduction for Ad ID: 22	2026-09-06 17:59:40.174264	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 17:59:40.174264
1378	4	10.50	Debit	Playback deduction for Ad ID: 23	2026-09-06 18:00:10.260495	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:00:10.260495
1379	4	97.30	Debit	Playback deduction for Ad ID: 22	2026-09-06 18:04:48.166278	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:04:48.166278
1380	4	1.05	Debit	Playback deduction for Ad ID: 22	2026-09-06 18:04:51.445848	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:04:51.445848
1381	4	10.50	Debit	Playback deduction for Ad ID: 23	2026-09-06 18:05:21.572047	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:05:21.572047
1382	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 18:07:00.976009	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:07:00.976009
1383	4	10.50	Debit	Playback deduction for Ad ID: 23	2026-09-06 18:07:30.942806	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:07:30.942806
1384	4	5219.00	Credit	Wallet top-up	2026-09-06 18:08:54.438533	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 18:08:54.438533
1385	4	35.00	Debit	Playback deduction for Ad ID: 22	2026-09-06 18:09:10.522529	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:09:10.522529
1386	4	46.00	Credit	Wallet top-up	2026-09-06 18:09:18.817336	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 18:09:18.817336
1387	4	35.00	Credit	Wallet top-up	2026-09-06 18:09:22.981765	\N	\N	COMPLETED	INR	\N	\N	2026-09-06 18:09:22.981765
1388	4	10.50	Debit	Playback deduction for Ad ID: 23	2026-09-06 18:09:40.546307	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:09:40.546307
1389	4	34.65	Debit	Playback deduction for Ad ID: 22	2026-09-06 18:11:20.022833	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:11:20.022833
1390	4	10.50	Debit	Playback deduction for Ad ID: 23	2026-09-06 18:11:50.030089	\N	\N	SUCCESS	INR	\N	\N	2026-09-06 18:11:50.030089
\.


--
-- Name: ad_daily_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ad_daily_stats_id_seq', 2, true);


--
-- Name: admin_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_logs_id_seq', 94, true);


--
-- Name: ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ads_id_seq', 23, true);


--
-- Name: advertisers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advertisers_id_seq', 4, true);


--
-- Name: campaign_ads_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_ads_id_seq', 14, true);


--
-- Name: campaign_devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaign_devices_id_seq', 1, false);


--
-- Name: campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.campaigns_id_seq', 19, true);


--
-- Name: device_location_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_location_history_id_seq', 1411, true);


--
-- Name: device_registration_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_registration_id_seq', 1, false);


--
-- Name: device_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.device_status_history_id_seq', 4851, true);


--
-- Name: devices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.devices_id_seq', 2, true);


--
-- Name: driver_daily_stats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_daily_stats_id_seq', 3831, true);


--
-- Name: driver_payment_methods_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_payment_methods_id_seq', 1, true);


--
-- Name: driver_wallet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_wallet_id_seq', 1, true);


--
-- Name: driver_wallet_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.driver_wallet_transactions_id_seq', 1, false);


--
-- Name: drivers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.drivers_id_seq', 2, true);


--
-- Name: installers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.installers_id_seq', 1, false);


--
-- Name: media_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.media_id_seq', 24, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: playback_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.playback_logs_id_seq', 1890, true);


--
-- Name: settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.settings_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.wallet_transactions_id_seq', 1390, true);


--
-- Name: ad_daily_stats ad_daily_stats_ad_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_daily_stats
    ADD CONSTRAINT ad_daily_stats_ad_id_date_key UNIQUE (ad_id, date);


--
-- Name: ad_daily_stats ad_daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_daily_stats
    ADD CONSTRAINT ad_daily_stats_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: ads ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);


--
-- Name: advertisers advertisers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisers
    ADD CONSTRAINT advertisers_email_key UNIQUE (email);


--
-- Name: advertisers advertisers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advertisers
    ADD CONSTRAINT advertisers_pkey PRIMARY KEY (id);


--
-- Name: campaign_ads campaign_ads_campaign_id_ad_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_ads
    ADD CONSTRAINT campaign_ads_campaign_id_ad_id_key UNIQUE (campaign_id, ad_id);


--
-- Name: campaign_ads campaign_ads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_ads
    ADD CONSTRAINT campaign_ads_pkey PRIMARY KEY (id);


--
-- Name: campaign_devices campaign_devices_campaign_id_device_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_devices
    ADD CONSTRAINT campaign_devices_campaign_id_device_id_key UNIQUE (campaign_id, device_id);


--
-- Name: campaign_devices campaign_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_devices
    ADD CONSTRAINT campaign_devices_pkey PRIMARY KEY (id);


--
-- Name: campaigns campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_pkey PRIMARY KEY (id);


--
-- Name: device_location_history device_location_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_location_history
    ADD CONSTRAINT device_location_history_pkey PRIMARY KEY (id);


--
-- Name: device_registration device_registration_activation_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_registration
    ADD CONSTRAINT device_registration_activation_key_key UNIQUE (activation_key);


--
-- Name: device_registration device_registration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_registration
    ADD CONSTRAINT device_registration_pkey PRIMARY KEY (id);


--
-- Name: device_status_history device_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_status_history
    ADD CONSTRAINT device_status_history_pkey PRIMARY KEY (id);


--
-- Name: devices devices_adsd_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_adsd_id_key UNIQUE (adsd_id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: driver_daily_stats driver_daily_stats_driver_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_daily_stats
    ADD CONSTRAINT driver_daily_stats_driver_id_date_key UNIQUE (driver_id, date);


--
-- Name: driver_daily_stats driver_daily_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_daily_stats
    ADD CONSTRAINT driver_daily_stats_pkey PRIMARY KEY (id);


--
-- Name: driver_payment_methods driver_payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payment_methods
    ADD CONSTRAINT driver_payment_methods_pkey PRIMARY KEY (id);


--
-- Name: driver_wallet driver_wallet_driver_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet
    ADD CONSTRAINT driver_wallet_driver_id_key UNIQUE (driver_id);


--
-- Name: driver_wallet driver_wallet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet
    ADD CONSTRAINT driver_wallet_pkey PRIMARY KEY (id);


--
-- Name: driver_wallet_transactions driver_wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet_transactions
    ADD CONSTRAINT driver_wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: drivers drivers_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_email_key UNIQUE (email);


--
-- Name: drivers drivers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_phone_key UNIQUE (phone);


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (id);


--
-- Name: installers installers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.installers
    ADD CONSTRAINT installers_pkey PRIMARY KEY (id);


--
-- Name: media media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: playback_logs playback_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_pkey PRIMARY KEY (id);


--
-- Name: playback_logs playback_logs_playback_session_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_playback_session_id_key UNIQUE (playback_session_id);


--
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_cashfree_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_cashfree_order_id_key UNIQUE (cashfree_order_id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_logs_admin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_admin_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_created_at ON public.admin_logs USING btree (created_at);


--
-- Name: idx_ads_ad_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_ad_type ON public.ads USING btree (ad_type);


--
-- Name: idx_ads_advertiser_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_advertiser_id ON public.ads USING btree (advertiser_id);


--
-- Name: idx_ads_media_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_media_id ON public.ads USING btree (media_id);


--
-- Name: idx_ads_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ads_status ON public.ads USING btree (status);


--
-- Name: idx_advertisers_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_advertisers_status ON public.advertisers USING btree (status);


--
-- Name: idx_campaign_ads_ad_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_ads_ad_id ON public.campaign_ads USING btree (ad_id);


--
-- Name: idx_campaign_ads_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaign_ads_campaign_id ON public.campaign_ads USING btree (campaign_id);


--
-- Name: idx_campaigns_advertiser_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_advertiser_id ON public.campaigns USING btree (advertiser_id);


--
-- Name: idx_campaigns_area; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_area ON public.campaigns USING btree (area);


--
-- Name: idx_campaigns_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_dates ON public.campaigns USING btree (start_date, end_date);


--
-- Name: idx_campaigns_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_campaigns_status ON public.campaigns USING btree (status);


--
-- Name: idx_device_location_history_device_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_location_history_device_id ON public.device_location_history USING btree (device_id);


--
-- Name: idx_device_location_history_recorded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_location_history_recorded_at ON public.device_location_history USING btree (recorded_at);


--
-- Name: idx_device_status_history_device_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_status_history_device_id ON public.device_status_history USING btree (device_id);


--
-- Name: idx_device_status_history_recorded_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_device_status_history_recorded_at ON public.device_status_history USING btree (recorded_at);


--
-- Name: idx_devices_adsd_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_adsd_id ON public.devices USING btree (adsd_id);


--
-- Name: idx_devices_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_devices_status ON public.devices USING btree (status);


--
-- Name: idx_driver_stats_driver_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_driver_stats_driver_date ON public.driver_daily_stats USING btree (driver_id, date);


--
-- Name: idx_drivers_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_drivers_phone ON public.drivers USING btree (phone);


--
-- Name: idx_notifications_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_status ON public.notifications USING btree (status);


--
-- Name: idx_playback_logs_ad_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_playback_logs_ad_id ON public.playback_logs USING btree (ad_id);


--
-- Name: idx_playback_logs_campaign_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_playback_logs_campaign_id ON public.playback_logs USING btree (campaign_id);


--
-- Name: idx_playback_logs_device_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_playback_logs_device_id ON public.playback_logs USING btree (device_id);


--
-- Name: idx_playback_logs_played_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_playback_logs_played_at ON public.playback_logs USING btree (played_at);


--
-- Name: ad_daily_stats ad_daily_stats_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ad_daily_stats
    ADD CONSTRAINT ad_daily_stats_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ads ads_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.advertisers(id) ON DELETE CASCADE;


--
-- Name: ads ads_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ads ads_media_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_media_id_fkey FOREIGN KEY (media_id) REFERENCES public.media(id) ON DELETE CASCADE;


--
-- Name: campaign_ads campaign_ads_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_ads
    ADD CONSTRAINT campaign_ads_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;


--
-- Name: campaign_ads campaign_ads_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_ads
    ADD CONSTRAINT campaign_ads_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_devices campaign_devices_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_devices
    ADD CONSTRAINT campaign_devices_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE CASCADE;


--
-- Name: campaign_devices campaign_devices_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaign_devices
    ADD CONSTRAINT campaign_devices_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.advertisers(id) ON DELETE CASCADE;


--
-- Name: campaigns campaigns_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.campaigns
    ADD CONSTRAINT campaigns_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: device_location_history device_location_history_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_location_history
    ADD CONSTRAINT device_location_history_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: device_registration device_registration_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_registration
    ADD CONSTRAINT device_registration_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: device_status_history device_status_history_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_status_history
    ADD CONSTRAINT device_status_history_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: devices devices_installer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_installer_id_fkey FOREIGN KEY (installer_id) REFERENCES public.installers(id) ON DELETE SET NULL;


--
-- Name: devices devices_last_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_last_ad_id_fkey FOREIGN KEY (last_ad_id) REFERENCES public.ads(id) ON DELETE SET NULL;


--
-- Name: driver_daily_stats driver_daily_stats_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_daily_stats
    ADD CONSTRAINT driver_daily_stats_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: driver_payment_methods driver_payment_methods_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_payment_methods
    ADD CONSTRAINT driver_payment_methods_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: driver_wallet driver_wallet_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet
    ADD CONSTRAINT driver_wallet_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: driver_wallet_transactions driver_wallet_transactions_driver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.driver_wallet_transactions
    ADD CONSTRAINT driver_wallet_transactions_driver_id_fkey FOREIGN KEY (driver_id) REFERENCES public.drivers(id) ON DELETE CASCADE;


--
-- Name: drivers drivers_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.drivers
    ADD CONSTRAINT drivers_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE SET NULL;


--
-- Name: media media_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.advertisers(id) ON DELETE CASCADE;


--
-- Name: media media_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: playback_logs playback_logs_ad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE SET NULL;


--
-- Name: playback_logs playback_logs_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.advertisers(id) ON DELETE SET NULL;


--
-- Name: playback_logs playback_logs_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;


--
-- Name: playback_logs playback_logs_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playback_logs
    ADD CONSTRAINT playback_logs_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_advertiser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_advertiser_id_fkey FOREIGN KEY (advertiser_id) REFERENCES public.advertisers(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict sXfcdiwUVHLOIgBb0yNvALUbE8oMvqYXLjuVoT3Jd9iV1Sbgnw0L8fJ2Wc4qpaM

