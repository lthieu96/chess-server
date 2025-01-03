PGDMP         7                |            chess-mobile    15.10    15.10 H    l           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            m           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            n           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            o           1262    24784    chess-mobile    DATABASE     �   CREATE DATABASE "chess-mobile" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Vietnamese_Vietnam.1258';
    DROP DATABASE "chess-mobile";
                postgres    false            f           1247    24915    blog_post_status    TYPE     N   CREATE TYPE public.blog_post_status AS ENUM (
    'draft',
    'published'
);
 #   DROP TYPE public.blog_post_status;
       public          postgres    false            `           1247    24847    game_status    TYPE     Y   CREATE TYPE public.game_status AS ENUM (
    'waiting',
    'active',
    'completed'
);
    DROP TYPE public.game_status;
       public          postgres    false            Z           1247    24807    role    TYPE     J   CREATE TYPE public.role AS ENUM (
    'user',
    'admin',
    'guest'
);
    DROP TYPE public.role;
       public          postgres    false            �            1259    24932    blog_post_likes    TABLE     �   CREATE TABLE public.blog_post_likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);
 #   DROP TABLE public.blog_post_likes;
       public         heap    postgres    false            �            1259    24931    blog_post_likes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.blog_post_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.blog_post_likes_id_seq;
       public          postgres    false    225            p           0    0    blog_post_likes_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.blog_post_likes_id_seq OWNED BY public.blog_post_likes.id;
          public          postgres    false    224            �            1259    24920 
   blog_posts    TABLE     E  CREATE TABLE public.blog_posts (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    status public.blog_post_status DEFAULT 'draft'::public.blog_post_status,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    thumbnail text
);
    DROP TABLE public.blog_posts;
       public         heap    postgres    false    870    870            �            1259    24919    blog_posts_id_seq    SEQUENCE     �   CREATE SEQUENCE public.blog_posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.blog_posts_id_seq;
       public          postgres    false    223            q           0    0    blog_posts_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.blog_posts_id_seq OWNED BY public.blog_posts.id;
          public          postgres    false    222            �            1259    24940    comment_likes    TABLE     �   CREATE TABLE public.comment_likes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    comment_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);
 !   DROP TABLE public.comment_likes;
       public         heap    postgres    false            �            1259    24939    comment_likes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.comment_likes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 +   DROP SEQUENCE public.comment_likes_id_seq;
       public          postgres    false    227            r           0    0    comment_likes_id_seq    SEQUENCE OWNED BY     M   ALTER SEQUENCE public.comment_likes_id_seq OWNED BY public.comment_likes.id;
          public          postgres    false    226            �            1259    24948    comments    TABLE       CREATE TABLE public.comments (
    id integer NOT NULL,
    content text NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    parent_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);
    DROP TABLE public.comments;
       public         heap    postgres    false            �            1259    24947    comments_id_seq    SEQUENCE     �   CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.comments_id_seq;
       public          postgres    false    229            s           0    0    comments_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;
          public          postgres    false    228            �            1259    24898    completed_puzzles    TABLE     �   CREATE TABLE public.completed_puzzles (
    id integer NOT NULL,
    user_id integer NOT NULL,
    puzzle_id text NOT NULL,
    completed_at timestamp without time zone DEFAULT now()
);
 %   DROP TABLE public.completed_puzzles;
       public         heap    postgres    false            �            1259    24897    completed_puzzles_id_seq    SEQUENCE     �   CREATE SEQUENCE public.completed_puzzles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.completed_puzzles_id_seq;
       public          postgres    false    221            t           0    0    completed_puzzles_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.completed_puzzles_id_seq OWNED BY public.completed_puzzles.id;
          public          postgres    false    220            �            1259    24819    games    TABLE     �  CREATE TABLE public.games (
    id integer NOT NULL,
    status public.game_status DEFAULT 'waiting'::public.game_status NOT NULL,
    fen text NOT NULL,
    white_player_id integer,
    black_player_id integer,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    winner integer,
    is_check boolean DEFAULT false,
    is_checkmate boolean DEFAULT false,
    is_draw boolean DEFAULT false,
    turn text DEFAULT 'w'::text NOT NULL,
    time_control integer DEFAULT 600,
    increment integer DEFAULT 5,
    white_time_remaining integer,
    black_time_remaining integer,
    last_move_time timestamp without time zone,
    is_private boolean DEFAULT false,
    moves text DEFAULT ''::text
);
    DROP TABLE public.games;
       public         heap    postgres    false    864    864            �            1259    24818    games_id_seq    SEQUENCE     �   CREATE SEQUENCE public.games_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.games_id_seq;
       public          postgres    false    219            u           0    0    games_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.games_id_seq OWNED BY public.games.id;
          public          postgres    false    218            �            1259    24786 
   migrations    TABLE     k   CREATE TABLE public.migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);
    DROP TABLE public.migrations;
       public         heap    postgres    false            �            1259    24785    migrations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.migrations_id_seq;
       public          postgres    false    215            v           0    0    migrations_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;
          public          postgres    false    214            �            1259    24795    users    TABLE     X  CREATE TABLE public.users (
    id integer NOT NULL,
    email text,
    password text,
    created_at timestamp without time zone DEFAULT now(),
    username text,
    role public.role DEFAULT 'user'::public.role,
    rating integer DEFAULT 1200,
    last_active timestamp without time zone DEFAULT now(),
    blocked boolean DEFAULT false
);
    DROP TABLE public.users;
       public         heap    postgres    false    858    858            �            1259    24794    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public          postgres    false    217            w           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public          postgres    false    216            �           2604    24935    blog_post_likes id    DEFAULT     x   ALTER TABLE ONLY public.blog_post_likes ALTER COLUMN id SET DEFAULT nextval('public.blog_post_likes_id_seq'::regclass);
 A   ALTER TABLE public.blog_post_likes ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    225    224    225            �           2604    24923    blog_posts id    DEFAULT     n   ALTER TABLE ONLY public.blog_posts ALTER COLUMN id SET DEFAULT nextval('public.blog_posts_id_seq'::regclass);
 <   ALTER TABLE public.blog_posts ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    223    222    223            �           2604    24943    comment_likes id    DEFAULT     t   ALTER TABLE ONLY public.comment_likes ALTER COLUMN id SET DEFAULT nextval('public.comment_likes_id_seq'::regclass);
 ?   ALTER TABLE public.comment_likes ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    227    226    227            �           2604    24951    comments id    DEFAULT     j   ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);
 :   ALTER TABLE public.comments ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    229    228    229            �           2604    24901    completed_puzzles id    DEFAULT     |   ALTER TABLE ONLY public.completed_puzzles ALTER COLUMN id SET DEFAULT nextval('public.completed_puzzles_id_seq'::regclass);
 C   ALTER TABLE public.completed_puzzles ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    220    221    221            �           2604    24822    games id    DEFAULT     d   ALTER TABLE ONLY public.games ALTER COLUMN id SET DEFAULT nextval('public.games_id_seq'::regclass);
 7   ALTER TABLE public.games ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    218    219    219            �           2604    24789    migrations id    DEFAULT     n   ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);
 <   ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    214    215            �           2604    24798    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    216    217            e          0    24932    blog_post_likes 
   TABLE DATA           K   COPY public.blog_post_likes (id, user_id, post_id, created_at) FROM stdin;
    public          postgres    false    225   �W       c          0    24920 
   blog_posts 
   TABLE DATA           c   COPY public.blog_posts (id, title, content, status, created_at, updated_at, thumbnail) FROM stdin;
    public          postgres    false    223   X       g          0    24940    comment_likes 
   TABLE DATA           L   COPY public.comment_likes (id, user_id, comment_id, created_at) FROM stdin;
    public          postgres    false    227   	u       i          0    24948    comments 
   TABLE DATA           d   COPY public.comments (id, content, user_id, post_id, parent_id, created_at, updated_at) FROM stdin;
    public          postgres    false    229   Vu       a          0    24898    completed_puzzles 
   TABLE DATA           Q   COPY public.completed_puzzles (id, user_id, puzzle_id, completed_at) FROM stdin;
    public          postgres    false    221   v       _          0    24819    games 
   TABLE DATA             COPY public.games (id, status, fen, white_player_id, black_player_id, created_at, updated_at, winner, is_check, is_checkmate, is_draw, turn, time_control, increment, white_time_remaining, black_time_remaining, last_move_time, is_private, moves) FROM stdin;
    public          postgres    false    219   Vv       [          0    24786 
   migrations 
   TABLE DATA           :   COPY public.migrations (id, hash, created_at) FROM stdin;
    public          postgres    false    215   �w       ]          0    24795    users 
   TABLE DATA           n   COPY public.users (id, email, password, created_at, username, role, rating, last_active, blocked) FROM stdin;
    public          postgres    false    217   �z       x           0    0    blog_post_likes_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.blog_post_likes_id_seq', 2, true);
          public          postgres    false    224            y           0    0    blog_posts_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.blog_posts_id_seq', 4, true);
          public          postgres    false    222            z           0    0    comment_likes_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.comment_likes_id_seq', 2, true);
          public          postgres    false    226            {           0    0    comments_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.comments_id_seq', 2, true);
          public          postgres    false    228            |           0    0    completed_puzzles_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.completed_puzzles_id_seq', 1, true);
          public          postgres    false    220            }           0    0    games_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.games_id_seq', 2, true);
          public          postgres    false    218            ~           0    0    migrations_id_seq    SEQUENCE SET     @   SELECT pg_catalog.setval('public.migrations_id_seq', 15, true);
          public          postgres    false    214                       0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 4, true);
          public          postgres    false    216            �           2606    24938 $   blog_post_likes blog_post_likes_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.blog_post_likes DROP CONSTRAINT blog_post_likes_pkey;
       public            postgres    false    225            �           2606    24930    blog_posts blog_posts_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.blog_posts DROP CONSTRAINT blog_posts_pkey;
       public            postgres    false    223            �           2606    24946     comment_likes comment_likes_pkey 
   CONSTRAINT     ^   ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (id);
 J   ALTER TABLE ONLY public.comment_likes DROP CONSTRAINT comment_likes_pkey;
       public            postgres    false    227            �           2606    24957    comments comments_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_pkey;
       public            postgres    false    229            �           2606    24904 (   completed_puzzles completed_puzzles_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.completed_puzzles
    ADD CONSTRAINT completed_puzzles_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.completed_puzzles DROP CONSTRAINT completed_puzzles_pkey;
       public            postgres    false    221            �           2606    24828    games games_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.games
    ADD CONSTRAINT games_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.games DROP CONSTRAINT games_pkey;
       public            postgres    false    219            �           2606    24793    migrations migrations_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.migrations DROP CONSTRAINT migrations_pkey;
       public            postgres    false    215            �           2606    24805    users users_email_unique 
   CONSTRAINT     T   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_unique;
       public            postgres    false    217            �           2606    24803    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public            postgres    false    217            �           2606    24817    users users_username_unique 
   CONSTRAINT     Z   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);
 E   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_unique;
       public            postgres    false    217            �           2606    24963 8   blog_post_likes blog_post_likes_post_id_blog_posts_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;
 b   ALTER TABLE ONLY public.blog_post_likes DROP CONSTRAINT blog_post_likes_post_id_blog_posts_id_fk;
       public          postgres    false    225    223    3262            �           2606    24958 3   blog_post_likes blog_post_likes_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.blog_post_likes
    ADD CONSTRAINT blog_post_likes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 ]   ALTER TABLE ONLY public.blog_post_likes DROP CONSTRAINT blog_post_likes_user_id_users_id_fk;
       public          postgres    false    225    3254    217            �           2606    24973 5   comment_likes comment_likes_comment_id_comments_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_comments_id_fk FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.comment_likes DROP CONSTRAINT comment_likes_comment_id_comments_id_fk;
       public          postgres    false    229    3268    227            �           2606    24968 /   comment_likes comment_likes_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.comment_likes DROP CONSTRAINT comment_likes_user_id_users_id_fk;
       public          postgres    false    3254    227    217            �           2606    24988 *   comments comments_parent_id_comments_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_comments_id_fk FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_parent_id_comments_id_fk;
       public          postgres    false    3268    229    229            �           2606    24983 *   comments comments_post_id_blog_posts_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_blog_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_post_id_blog_posts_id_fk;
       public          postgres    false    3262    223    229            �           2606    24978 %   comments comments_user_id_users_id_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.comments DROP CONSTRAINT comments_user_id_users_id_fk;
       public          postgres    false    217    3254    229            e   <   x�e�A�0 �7���0p�4AK�먀�{CRJpj����n���=^E��Ӥy���k����T      c      x��\[��ֵ~N~�Nϋ]hdQw�y(j�I�ة�:i����h�E�9�%(���t�E��#0����]�A�M�?柜u��ޔ�K��C3��}Y{�o}��tyqg�����*^�I����ѯ�>IUtr�`���;��N��x��ñ;���L�����s��Y����K�7�����e�(q�s;�9w��^�s:]�Y�8��A�߭����F��T;-�������w�7'�������Z>�6|�����>|�x��'G������'jgqG������M*?�Y��a�ï�
�7<9�(���T.��	,�n�"\����a,@��^��`� �.��J�����=9��SΦ:�����S�ᓣ������U:]<Pc~�����n��l�(V���wc��p������4x�]���i�3��a��~���`X*}��,��}���A��?c��c�(�x���ŗ����?�BP�zw�F,|XUH.���ߨ��U*�}N����8��7���Ve{<��#�쿥���_e3:;����Wc�?wፋ[[��I0�y<���I,�h�_}S�G�IA�>���y��zt �KB�S�G奝{�|R�1N:�IX:ÐN8E�N*���i�L*{�Y\Q37c���$h9�cx,�&��N��w��t�pH�.�z�2��[�j�6�&`Ǽ�]�ŁgK�Fb��ZS���&QA��}����}�����\Pr����X���<HAnG�Uՙ�|�zx�:y-IF���>0��gOS^F������j��/�"%Ȯ���-��02������o]�#ڛ���A.ٸ���x �P�
����l��n���w2�����d����7|�����ж��.��ZkS���%�rB�u�$a}W�K��1Z�W�:��9K*x ��}�2������S��٪>G�'i2���ZΩ��j��7��jq�7�t��S�A��[B����E���+�g.��:@���2����� M|�ң�D�P6�������%x�t��.O	���UY�v)���S�[�8��c�[���4�~-��n��j�w4��$�,o�}��g?$��D_*�I(�d|�͏��WvQ��'�Bg�������֛׳���򾿆��}�c�.VX��-^���%y8fx�?���"�BeAB"~�4
Y�g�����iNZ�V�1��+R��y`��>-4�������+d'<C���Gq����,&��Ɍ H��mt���o����������@b�{�x��i����7�t�/M�~��R�Von8��zK9�M���Ԫ�Z��~�7z]^�s�VtӍܨ���q�e��,��}w�����d
���%��������s�(n�A6��n���?kh8�z�鵜f��i�)�x��RG�ur�w�AR<$��j�&|�!������j���[.DAy���m�o��N�f?ϱ8
}�	���X�Q��!�p1����X�+��݄� s"�s|@�����8A�2D�R�Y֠�Ql O�� A&�~��f��1z�ǿW�g����!H@��m�<8)���_�i�`w祹�����p!B;�d���?�kyP�rPf�� ��A7��Ą �	2���I�?W��3Д��P�ڙ ��P�����z��{�r����� M��}��F�f?�VV16]��ߌ��0\�c�>���_�)�� ��pS��?��q��)�#���\�_�Y�� �F$�mF����BT$�ߡ
��28�LÙښ���<�-v�>�&��]�k֐<���X�`qXU�?2�f�����߭��7����FcW|uō�d��R����؍H���;�
s��E�q�/-�D��!�HP��=!����D�l�S�;��'}j�� H�<�'ih9}�8���1����A>��'J!��4~���.ȡ�;�l�I_�����NGj�������~����tl��I�)(	H���D�7j���J�K�恷�!�JuՇ�B7�~����9 D��ZD�X��g{���$.K#��JYr(�@20\�æ4=b A�=�92T�-��V{��G��$�[��x�xc�V��r�s�qD�r���9��k�g�N���|�v/Q��^s� �D]p���0xg�`S�Y6Q[a|+�o�~4X��>���ɘm��J�/��`�^KN�@��)�u�ݸ��g�����ँ�֊Y�5hkD�L4���	f'�l ��8H�!��S�'Ox�x)�dU�S?�8��&�ZR10�t��?]�M{�[����yÁ���@�j�E47�̢�z/�t'��pTe�U�v:����'��T�#�f$&���8���ɯ=M]��s��\EЂx��z�q����t��rgw
�iA�Oc7M"�v:����-F.^V�N����/�	�]~�}�!�b�=�����dF'2�~J9<9R� ���1�U�s'�i�;c�	�qy5T	�״!L��@�v���~��F-���%q3�����S��[jЪ���iS]�P����i�B�}�h�w������ �u�!�a*Ő��v�r��؈�����H?�-/�r�+�N��� ��u�Q�a?l��o&�Ł��.# f�� �<��vcy�z�ڣ7��z3G��s��[��<
��T���'d~�`6b��!�0�q
����S��uT�;?�N�ƝK�|�KhZ��x7�?����0�P���k
�]���Ȅ���7>�Mfi� Rݑ�,V���V����`n!tbɝ	�0��5rbH�R���੢�GQC�-񫸪�� a1H8Zޥ�s��S��b,c�8�K��]��[�ײ~��@H���O�~X�����2$g��G��c�H�����iZR2�-rQ�RO�\��ot�%(��B�K�^�՞>ܒ��!���@K�iv�4�^s��6<y1J(�\�N0�����8�!��0���v�x5O�>|���;o��<K��\�%�KR��")2�_�y*��q�A�yq�G��w4ɴE���'Rf�"qؑ�@��^s��9&��e.�K�^�*]���=�$�-m���E�\��hd���z�W�k�w]1�.�S.9�D�7h��($���P>n��G1��eq�o�9�~$5�
�E�Im�08��� �-P,T(U���"�i�i��p��㊵�h����p�F� W
����(��Q!��;bFN�<��$���F�V[)�j�I��a���G�����Z�)�&��gE3����ݖc�,�^﹢�z�ٴ�pj��9N�mK�Ð<igp��Sn�ׯ�-:�)t��B�&8�*�h�ـ��)@U�՟����Z^WE�����M'5z,�zbw���TL&R�4X�	ٿ��[��,�/wf�sͦ��ͩW�á�aJ(DHGPV�p��Z�1�r�H9P��f.�Y2}E~����/�e��hI��A����+Ro+�B��g����K;@}�lĦ)߮� y�x�0TS����{r�}y6S�k/'N;+\`�L�+/�|��%�E��%t�̃%P�a��?���k�
0�c�*���ă� ��������F�"mG%u��-u��@�[� �r���4|v!ou��xof�0U�$����x��=`���o)����aD��յZF�\@�����wbL[k�)ӴO�ڿڭ�6ܭXW�Iٿ�4Y��R`�]���"�+:�!Yl�����aك�+�w���l��� F�zia�A^Q1�3 {m�j��ImM��������cX��ͨ� m�Vl��T����iB���Xߔ�g������b�2ĕ�ܓx�4<��K@+���C���`���ZC1H��f�hcլlI%����~���r���8�y NB��_�bNp�k�%����~q�U�>N�wM�<uw�W��th�Ȱ3֎�l}&��Vc �|؂P�_ᩭ�:���)6�ne3r��i�z�:�J.�F��E֬��z��6��kuju=h�s��L�� # �  ֍&k���s;gS����G��3f�e��2�{޵~�fÍU�����r#�U�.j|�
'�P��%�o٧�?��?��C���L0�r?.z��e/�f]>��'����m^v�/�Q��ai 謺į��ɑc^zf���������8KR��l�%��l
�?S}��K-;��/vM��=s�p<�fG�ĂՊ{\��P��Ra��K�$��������[*�I/���hlh
CQ�f�D���矞�$M�m�ĸ;����y��+�x�2R|0a�
��߂�_	���~۽9H�7��֊�^���E��l6j�^��8�'}u�Mb�f��Z�v��v��$���1��l\B��BT4�O9Q��w�9�^�]m����~����\�Q�t�v{��3��xu���o�����.��V�O\R����
��}4��Bkc��3�z��H��6��P�I:w���H�0�+����Q�����(L����,��*��B����b�ch�ء} C�����_����T��o����\Z�@Xb6z�w�v��q>�j����9�a1<�<|�)�m�<+MmR�Ai4�V����P$|h#����U��%t/�ٜ�złI�o<��c-��n�ų0�um���������E�x'�j����7%�H���5�+�VI\�cI�3�Ϋ
��r�,�ec~��T_�D�
ɭl�����y�l��x�:���H�)��s#W�Q詈G�Gܡ*/����b���s��q��m��w��F���H��I��7�;��i4�y�I��+�pAͨc���Ӣ�R�_���Y��|�!-���ͤ��@���>����Ѿ���q��Af��(An���P��U�����E�	��cn6��Vn��Y
�bJV
��+����kЎ�۠�[j�J쓚԰�Ҳ9���b.mt�R~~��%�Қy�/���<��q���nT�{9\-��tO�2�|G�y�2�=�� �  ��п���3��27��j��q�Z��.F����f����1X|8Kݑ?�3P�d�L�,�6�.�*��Ν�p��W�<�����!��1Mƪ��AU�O�v̢��t�Ob����g�l������?�S�5�3 |>�ڡ�:c�&�	8�WR�O�[K^HO�y�7.���^�oX4E�m�YrEl�(>J]k��iGFoB��#Nç���vz��cP2B�����2�{9k`��֗�ƌE���%�[��l��w�Y9UpH�+���qM�����}K9�HX"Y�$y0j�p�Y���v��2�P~���s���>�S�t�h�5=���&&~P]�ͩ����}��dS�މ㦓����w�
zc��ZiY�9�b�¾�MH�\�M,!�x
������u���H�ˊ���D��_��	�~a��E�<���O����;;2׊�(�%#`nr�x�����ض�E�Kѽi�6�Hߞ�<pk݉��.R�yNUn}��$q~[/v�.&ۇ��kʤϘ�i����$�RϮ$idD05#%���eB_��rl�9�"(6��,�K��	�/��iڊ�=t[%[iW��o)]v��/dcP���)��%��0���s�јt�)���12�>�e�0�|�o��;Ec�g1<,�D#�{/c�eҵ\��ŉiK�a���;V$�I$y����:e��MQC�)Ѳyj�˔�
���n����JrD��-kj���6��φ;d+*�b�i������z�u�xt�ƸW��NU]^��1Ҳ�5����'�e��}"n6s�R��H�|��_�b�]��/��^�>벏u\�Ua%�>U�EsY��65���`����d���m3HG�B�����.麨�Q@!Ai��	�� �p�F��;7��e�<�R������[�A�.�����"v7��j��n5�O�ꔳ�u�Wk8�n��鶚-�"69���Ԁ2T�5t[!�,��|�_���;�f����j=�3n�֝N�W�t:��R�ׇϬ~9O�ã6��'9,\Y"&%B���<��	�d�'��f0�G	hy�3�m��z������$��dō����-Y�h��-@ܱf�R��������u[�����'���	I8ߟ���/��ļk7NWϪ�!'�.t�b�����覙5�`\�s�+<�G*ɕ����T��W�X�sI�
Έ�"�fx<&}���4�=�x��%I�徢DOU�t��Xg,�L��X�z�t�t5�V��5�� s��] ����~�%�uL(�f�$�B���7p�lmȼX�rs������xlz����E����橸���Ӹ\�v���N���M���s\wZtL�ƚ�z毬6]��HRJe/��DB_3�Mc6�b�r�IY���M5R�Ժ�B�&*�� �!qc.�P��^�L22P fD��H�������>eVB���l�Q)�Z�ׂ�3��C9�վ��!�)1+���.x�S�\B=�_�u�r������Y���a)Uר��.n�'�&��"<&Q�m�sj���1����LŤ���r��4�j�>�����0����:=��	8�	89d�0�}��E�{�/:�|�Yd'����w�df���x�_�.��������S��M��0	�
��hחvt�W�tҎ��G?](P58>�P�!�H�&�qN
����&��j퉋�:����?k�����Հ4�#��}�+w
	Sɮ��6=Z�Ђy����OH�������4_&E]�r��.��*�%`BN�Zz�KU^��YC>��
i����_����/t�=,'�yX��*	Yu8��'��
�z��Q��%�Z���A��^��wXP�����z]�JjZy��/��׷������fz̍n�~��w
	c"�_�U� ǿ��)�XJӘ}C�B�M�_uZ�X�-XcR�u��/:C'�D�ۅ��J-�OZ:.���ad��؋;A�x #@+��L�o(�W{R��T�5V�i���
|�Jͱ�v��Lc��[���=�[+q�_h�ЪyU�p#I��7QR���,��1M�|�M=,�6�>��XHA�YC|j��oF� ��g�K�����{��6���:�~�SJ�̽���h]_W=�/X%A�C3���rI�r�����8Laݫ����Nf�e�]Pu���`�J�^x�뒭5>�yZ,�B�CO&.r�d"��}N�HSf�:ݱ`�YW�Jo��[*��a��]F��hP�ƲT�~(V0]��%�_(2�<z�I��]�p�n�Z��Z�
l�6[�j����9�SN6۵v���j�v��pN~P}���xB��      g   =   x�Uʻ�0���F�Cl�Y���s�1
A�������:����/p���ί2���4      i   �   x�3�t:� S�,���%
Ew--QHz�{����:
y���(�^�������~l���s3r	�=�A!��EEENcN�?N##]C#]#S#+#+Ss=cK3<R\F��`��+��Z��P�tL%�{?��|Ct3,�L-��M�M���Hq��qqq 0�J�      a   2   x�3�4�400*J�4202�54�52U02�20�21�37702������ �e�      _   ~  x�}QMo�0<�_�=o�߳�:H�pEr��\�|l��[U
?��m#�R�<��g1#j��c���^�~cmw��]�nG�A��գv���\����F9e�q'���ZL����s�����++F�b��{>�Θ�C�������Y�-����-͞2>�7�LGO�b���3pW�Yh=0*�Hk���t�F�	�R@a�qg�h�3���LG��@�z�s�= ��<а04�l�Ol��}�aڄ�͍�D����B)�K�����w[�=�M��v5r�h5���щ�i�9կ�0!2�?H̝;��w���e�%��Zc�o���_�l;��Y��z7�-�Xl]��p���]�g�p7�8~�H������� ١�      [   �  x�-���8D�v0�K.s))���݀6 �T�W����GY�t�^,��Ɏ���v�����~X�AgH�㴗�h�+��A3����R�r��:b|�[�q�.=~��0�|��n'obܐg�w�*W�Pe�ZR��+�u����'��BAf�<uϢ9�Rؖ����48z���+�L,@V��
f������fJ��cqdKm?~rk����췝;|����#�w����t��=�Q0��GM&�V�*g��ް�ؙz��}�� $V��=��Y�9:!����a{��[w��T���M�f���}#d�,p�˝� �&�7E���B�������L�w�
s7�A���V�����Ǜ2�����6�rU��}�����{����7l���^ݛ���I�f�8'd�ġ��rN��Qz��8"8�� ����E���|���g�=�;T���� N�gɤ!5�N��:`�5R�{u"_S�S#i����ʣHӾ�;�7Ix��!�tс ^}����sX3/�%ê�U���4D�E~]]:��L�J��Cl�Ѵ��uR�k�A��pkM�2��b~�'�;�s�a�Þ֪�<��3��^�F[+\}ݚ�N�Lj,(�ؑ��h�/�4���fv�vNӼ$WOن�5ʝG��`��:𹿾��bf5������}� �7�      ]   T  x�}��n�@F��]�u:3\�a%�Z�I%�����p�>}��Mߤ&m��������I�'k�
j�d� ,�Dj�E�Ʈ'v|&�8��4{I���.N,���(��$V����xh�t�ޖ0�j�&��f*���@�D#���s��m(c���(�Q�[Q�֛�:{
&|P���4�o����Ɓ�����[&���.;}��oӼ�C�pa$��MD�A�'V�j��W�PV$Q�G�6.��p�ԛVa6�d����r�0s�Emgfs��|1�KOX$x�c-?�ahb݄�D5�Eފ�՝W}~����PV%�^��Y�ܹ"UbBH 2.�?eH(ρ,�_�쟶     